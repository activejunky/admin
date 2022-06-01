import React, { DragEventHandler, PropsWithChildren, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  UniqueIdentifier
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AJStore } from '../../Models/Models';
import { SocketAddress } from 'net';
import { StoreIcon } from '../../Views/StoreIcon';


function SortableItem(props: { id: UniqueIdentifier, stores: AJStore[], onRemove: (urlSlug: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });
  const matchingStore = React.useMemo(() => props.stores.find(s => s.url_slug == props.id), [props.stores])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {matchingStore
        ?
        (
          <StoreIcon ajStore={matchingStore} onRemove={() => {
            props.onRemove(props.id as string)
          }} />
        )
        :
        (<></>)
      }
    </div>
  );
}

type AJStoreDnDProps = {
  stores: AJStore[]
  onRemove: (urlSlug: string) => void
}

export const AJStoreDnD: React.FC<AJStoreDnDProps> = ({ stores, onRemove }) => {
  const [items, setItems] = useState<UniqueIdentifier[]>(stores.map(s => s.url_slug));
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  React.useEffect(() => {
    console.log("STORES CHANGED! ", stores)
    setItems(stores.map(s => s.url_slug))
  }, [stores])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items}
        strategy={horizontalListSortingStrategy}
      >
        <div style={{ display: 'flex', width: '100%', flexWrap: 'wrap' }}>
          {items.map(id => <SortableItem key={id} id={id} stores={stores} onRemove={onRemove} />)}
        </div>
      </SortableContext>
    </DndContext>
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over?.id ?? '3');

        const newOrder = arrayMove(items, oldIndex, newIndex);

        return newOrder
      });
    }
  }
}
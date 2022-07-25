import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { AJStore, Deal } from "../Models/Models";
import { StoreIcon } from "../Views/StoreIcon";
import { DealTile } from "./DealView";

const grid = 8;
const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  // padding: grid * 2,
  margin: `0 ${grid}px 0 0`,

  // change background colour if dragging
  background: isDragging ? 'lightgreen' : 'white',

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  display: 'flex',
  padding: grid,
  overflow: 'auto',
});

const reorder = (list: AJStore[], startIndex: number, endIndex: number): AJStore[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};


interface Props {
  items: AJStore[]
  onRemove: (store: AJStore, rowIdx: number) => void
  onReorder: (newStoreList: AJStore[]) => void
}

export class EditAdditionalStoresRow extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);

    this.onDragEnd = this.onDragEnd.bind(this);
  }

  onDragEnd(result: any) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(
      this.props.items,
      result.source.index,
      result.destination.index
    );

    this.props.onReorder(items)
  }

  render() {
    return (
      <div style={{ height: 300, width: '100%' }}>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <Droppable droppableId="droppable" direction="horizontal">
            {(provided: any, snapshot: any) => (
              <div
                ref={provided.innerRef}
                style={getListStyle(snapshot.isDraggingOver)}
                {...provided.droppableProps}
              >
                {this.props.items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                    {(provided: any, snapshot: any) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style
                        )}
                      >
                        <div>
                          <StoreIcon ajStore={item} />
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    )
  }
}
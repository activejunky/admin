
export type AJStore = { id: number, url_slug: string, name: string, image_url: string }

export type Deal = {
  readonly _tag: "Deal",
  readonly id: number,
  readonly title: string,
  readonly description: string,
  readonly store: AJStore,
  readonly expires: string,
  readonly deal_code: string,
}
export interface ForumCache {
  [k in string]: {
    wikitext: ForumElement[]
    html: ForumElement[]
  }
}

export interface ForumElement {
  forumid: string
  meta: ForumMeta
  threads: ForumThread[]
}

export interface ForumMeta {
  pageName: string
  title: string
  depthMax: number
}

export interface ForumThread {
  threadid: string
  content: string
  meta: Record<string, any>
  threads?: ForumThread[]
}

import {ActiveRecord} from './ActiveRecord'

describe('ActiveRecord', function() {
  const Post = ActiveRecord({
    name: 'Post',
    fieldNames: ['title', 'body'],
  })
  it('should create new record', function() {
    expect(Post.new().toJSON()).toEqual({
      id: expect.any(String),
      createdAt: expect.any(Number),
      modifiedAt: expect.any(Number),
      title: null,
      body: null,
    })
  })
  it('should create new record with specified field values', function() {
    const title = 'Post Title'
    const body = 'Post Body'

    expect(Post.new({title, body}).toJSON()).toEqual({
      id: expect.any(String),
      createdAt: expect.any(Number),
      modifiedAt: expect.any(Number),
      title,
      body,
    })
  })
})

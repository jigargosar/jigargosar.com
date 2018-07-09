import {ActiveRecord} from './ActiveRecord'

describe('ActiveRecord', function() {
  const Post = ActiveRecord({
    name: 'Post',
    fields: ['title:string', 'body:text'],
  })
  it('should create new record with fields', function() {
    expect(Post.new().toJSON()).toEqual({
      id: expect.any(String),
      createdAt: expect.any(Number),
      modifiedAt: expect.any(Number),
      title: '',
      body: '',
    })
  })
})

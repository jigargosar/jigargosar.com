import {ActiveRecord} from './ActiveRecord'

describe('ActiveRecord', function() {
  it('should not crash', function() {
    const Post = ActiveRecord({
      name: 'Post',
      fields: ['title:string', 'body:text'],
    })

    expect(Post.new().toJSON()).toEqual({
      id: expect.any(String),
      createdAt: expect.any(Number),
      modifiedAt: expect.any(Number),
    })
  })
})

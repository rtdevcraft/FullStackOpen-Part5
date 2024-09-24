import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'
import blogService from '../services/blogs'

// Mock the entire blogService module
vi.mock('../services/blogs', () => ({
  default: {
    update: vi.fn(),
  },
}))

describe('Blog component', () => {
  const blog = {
    title: 'Test Blog',
    author: 'John Doe',
    url: 'https://testblog.com',
    likes: 5,
    user: {
      username: 'johndoe',
      name: 'John Doe',
    },
  }

  const user = {
    username: 'testuser',
  }

  let mockUpdateBlog
  let mockRemoveBlog

  beforeEach(() => {
    mockUpdateBlog = vi.fn()
    mockRemoveBlog = vi.fn()
    vi.mocked(blogService.update).mockResolvedValue({
      ...blog,
      likes: blog.likes + 1,
    })
  })

  test('renders content', () => {
    render(
      <Blog
        blog={blog}
        user={user}
        updateBlog={mockUpdateBlog}
        removeBlog={mockRemoveBlog}
      />
    )

    const element = screen.getByText('Test Blog John Doe', { exact: false })
    expect(element).toBeDefined()
  })

  test('renders blog title and author, but not URL or likes by default', () => {
    render(
      <Blog
        blog={blog}
        user={user}
        updateBlog={mockUpdateBlog}
        removeBlog={mockRemoveBlog}
      />
    )

    expect(
      screen.getByText('Test Blog John Doe', { exact: false })
    ).toBeDefined()
    expect(screen.queryByText('https://testblog.com')).toBeNull()
    expect(screen.queryByText('likes 5')).toBeNull()
  })

  test('blog URL and likes are shown when the view button is clicked', async () => {
    render(
      <Blog
        blog={blog}
        user={user}
        updateBlog={mockUpdateBlog}
        removeBlog={mockRemoveBlog}
      />
    )

    const viewButton = screen.getByText('view')
    await userEvent.click(viewButton)

    expect(screen.getByText('https://testblog.com')).toBeDefined()
    expect(screen.getByText('likes 5')).toBeDefined()
  })

  test('like button event handler is called twice when clicked twice', async () => {
    render(
      <Blog
        blog={blog}
        updateBlog={mockUpdateBlog}
        removeBlog={mockRemoveBlog}
        user={user}
      />
    )

    const viewButton = screen.getByText('view')
    await userEvent.click(viewButton)

    const likeButton = screen.getByText('like')
    await userEvent.click(likeButton)
    await userEvent.click(likeButton)

    // Wait for any pending promises to resolve
    await vi.waitFor(() => expect(mockUpdateBlog).toHaveBeenCalledTimes(2))
  })
})

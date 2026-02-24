# Modal Component Usage Guide

## Overview

The `Modal` component is a reusable, accessible modal dialog that fixes common issues like:
- ✅ Proper z-index positioning (z-9999)
- ✅ Body scroll lock when modal is open
- ✅ Escape key support
- ✅ Backdrop click to close
- ✅ Proper focus management
- ✅ Responsive design
- ✅ Backdrop blur effect

## Basic Usage

```jsx
import Modal from '../components/Modal';

function MyComponent() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button onClick={() => setIsModalOpen(true)}>Open Modal</button>
            
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Modal Title"
                size="md"
            >
                <div className="p-6">
                    {/* Your modal content here */}
                    <p>Modal content goes here</p>
                </div>
            </Modal>
        </>
    );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | Required | Controls whether the modal is visible |
| `onClose` | `function` | Required | Function called when modal should close |
| `title` | `string` | `undefined` | Modal title (shown in header) |
| `children` | `ReactNode` | Required | Modal content |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| 'full'` | `'md'` | Modal width size |
| `showCloseButton` | `boolean` | `true` | Whether to show the close button in header |
| `onBackdropClick` | `function` | `onClose` | Custom function for backdrop clicks |
| `className` | `string` | `''` | Additional CSS classes for the modal content |

## Size Options

- `sm`: max-width: 24rem (384px)
- `md`: max-width: 28rem (448px)
- `lg`: max-width: 32rem (512px)
- `xl`: max-width: 42rem (672px)
- `2xl`: max-width: 48rem (768px)
- `full`: Full width with margins

## Examples

### Simple Form Modal

```jsx
<Modal
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    title="Add New Item"
    size="md"
>
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <input type="text" placeholder="Name" />
        <button type="submit">Submit</button>
    </form>
</Modal>
```

### Large Modal with Custom Content

```jsx
<Modal
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    title="View Details"
    size="xl"
>
    <div className="p-6">
        {/* Large content here */}
    </div>
</Modal>
```

### Modal Without Title

```jsx
<Modal
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    size="md"
>
    <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Custom Header</h2>
        {/* Content */}
    </div>
</Modal>
```

### Modal with Custom Backdrop Behavior

```jsx
<Modal
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    onBackdropClick={() => {
        if (confirm('Are you sure you want to close?')) {
            setIsOpen(false);
        }
    }}
    title="Important Action"
    size="md"
>
    {/* Content */}
</Modal>
```

## Migration from Old Modal Pattern

### Before (Old Pattern - Has Issues)

```jsx
{isModalOpen && (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
                <h3>Title</h3>
                <button onClick={() => setIsModalOpen(false)}>
                    <X size={20} />
                </button>
            </div>
            <div className="p-6">
                {/* Content */}
            </div>
        </div>
    </div>
)}
```

### After (New Pattern - Fixed)

```jsx
import Modal from '../components/Modal';

<Modal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    title="Title"
    size="md"
>
    <div className="p-6">
        {/* Content */}
    </div>
</Modal>
```

## Key Improvements

1. **Body Scroll Lock**: Prevents background scrolling when modal is open
2. **Proper Z-Index**: Uses z-9999 to ensure modal appears above all content
3. **Escape Key**: Press Escape to close the modal
4. **Accessibility**: Proper ARIA attributes for screen readers
5. **Backdrop Blur**: Modern blur effect on backdrop
6. **Consistent Styling**: Uses CSS variables for theming

## Notes

- The modal automatically locks body scroll when open
- The modal closes on Escape key press
- Clicking the backdrop closes the modal (unless `onBackdropClick` is customized)
- The modal content is scrollable if it exceeds max-height
- All styling uses CSS variables for consistent theming

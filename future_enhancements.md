# Future Enhancements

## Apple OS UI Integration
In the future, we plan to introduce an "Apple OS" style UI mode for the SAi Website. The following features were prototyped and can be re-integrated:

1. **Apple-style Glassmorphism**:
   - Update `index.css` with cleaner Apple-like glass tokens:
     - `background: rgba(255, 255, 255, 0.05)` (dark mode) / `rgba(255, 255, 255, 0.6)` (light mode)
     - `border: 1px solid rgba(255, 255, 255, 0.1)`
     - `backdrop-filter: blur(30px)`
     - `border-radius: 24px` for pills and elements

2. **Typography**:
   - Change `font-family` to `Inter, -apple-system, BlinkMacSystemFont, "San Francisco", "Segoe UI", Roboto, Helvetica, Arial, sans-serif` for that native iOS/macOS look.
   - Use lighter font weights for primary text (e.g. `font-weight: 400` and `500`).

3. **Message Bubbles (iMessage Style)**:
   - Chat bubbles should have pill-shaped `border-radius` (e.g., `20px` all around, except the corner where the message originates, which can be `4px`).
   - Tighter padding (`12px 18px`) and better alignment.

4. **Animations (Apple Intelligence Style)**:
   - Implement an under-bar magical glow that breathes when the user is typing (combining Gemini colors with Apple's Siri/Apple Intelligence vibe).
   - Use smooth, native-feeling easing functions for all `framer-motion` transitions (e.g., `ease: "easeOut", duration: 0.3`).
   - Remove jagged conic-gradient spinners in favor of clean expanding drop-shadows `box-shadow: 0 12px 48px rgba(0, 122, 255, 0.25)`.
   - Restore the background plasma blobs that emerge gently from the bottom of the screen upon input focus.

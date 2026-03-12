import { useForm, ValidationError } from '@formspree/react';
import { X, Rocket, Send } from 'lucide-react';
import { Flex, Text, Button, Input, Box } from '@shared/ui';
import { useTheme } from 'styled-components';

export const RequestAccessModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [state, handleSubmit] = useForm("meerkojd");
  const theme = useTheme();

  if (!isOpen) return null;

  return (
    // 🌟 The Dark Overlay
    <Flex 
      $fill 
      $align="center" 
      $justify="center" 
      style={{ 
        position: 'fixed', inset: 0, zIndex: 9999, 
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' 
      }}
    >
      {/* 🌟 The Modal Box */}
      <Box 
        $bg="bg.surface" 
        $p="xl" 
        $radius="lg" 
        style={{ 
          width: '100%', maxWidth: '400px', 
          border: `1px solid ${theme.colors.border.default}`, 
          position: 'relative',
          boxShadow: theme.shadows.lg 
        }}
      >
        <Button $variant="icon" onClick={onClose} style={{ position: 'absolute', top: 16, right: 16 }}>
          <X size={18} />
        </Button>

        {state.succeeded ? (
          <Flex $direction="column" $align="center" $gap="md" $p="lg 0 0 0">
            <Rocket size={48} color={theme.colors.palette.primary.main} />
            <Text $size="lg" $weight="bold">You're on the list!</Text>
            <Text $color="muted" $align="center" style={{ lineHeight: 1.5 }}>
              Thanks for your interest. We're letting people in batches, and we'll reach out with your invite code soon.
            </Text>
            <Button onClick={onClose} $variant="ghost" style={{ marginTop: 16 }}>Close Window</Button>
          </Flex>
        ) : (
          <Flex $direction="column" $gap="lg">
            <Flex $direction="column" $gap="xs">
              <Text $size="lg" $weight="bold">Request Early Access</Text>
              <Text $color="muted" $size="sm">Axon is currently in closed beta. Drop your details below to skip the line.</Text>
            </Flex>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Flex $direction="column" $gap="xs">
                <Text $size="xs" $weight="bold" $color="secondary" $uppercase>Your Name</Text>
                <Input id="name" type="text" name="name" required placeholder="Neo" />
              </Flex>

              <Flex $direction="column" $gap="xs">
                <Text $size="xs" $weight="bold" $color="secondary" $uppercase>Email Address</Text>
                <Input id="email" type="email" name="email" required placeholder="neo@matrix.com" />
                <ValidationError prefix="Email" field="email" errors={state.errors} />
              </Flex>

              <Flex $direction="column" $gap="xs">
                <Text $size="xs" $weight="bold" $color="secondary" $uppercase>What are you building? (Optional)</Text>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  placeholder="I want to map out my legacy React app..."
                  style={{
                    background: theme.colors.bg.overlay,
                    border: `1px solid ${theme.colors.border.default}`,
                    borderRadius: theme.radii.md,
                    padding: '8px 12px',
                    color: theme.colors.text.primary,
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.colors.palette.primary.main}
                  onBlur={(e) => e.target.style.borderColor = theme.colors.border.default}
                />
                <ValidationError prefix="Message" field="message" errors={state.errors} />
              </Flex>

              <Button type="submit" disabled={state.submitting} $variant="primary" style={{ marginTop: '8px' }}>
                <Flex $align="center" $justify="center" $gap="sm">
                  <Send size={16} />
                  <Text $weight="bold">{state.submitting ? "Sending..." : "Request Access"}</Text>
                </Flex>
              </Button>
            </form>
          </Flex>
        )}
      </Box>
    </Flex>
  );
};
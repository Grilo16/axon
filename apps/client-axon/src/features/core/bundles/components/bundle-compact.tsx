import { Package, FileCode, ShieldAlert, Copy, Loader2, EyeOff, Eye } from 'lucide-react';
import { useBundleSession } from '@features/core/bundles/hooks/use-bundle-session';
import { Flex, Card, Text, Button } from '@shared/ui';
import { useTheme } from 'styled-components';

export const BundleCompact = () => {
  const { activeBundle, generateAndCopyBundle, isGenerating, hideBarrelExports, toggleHideBarrelExports } = useBundleSession();
  const theme = useTheme();

  if (!activeBundle) return null;

  const fileCount = activeBundle.options?.targetFiles?.length || 0;
  const ruleCount = activeBundle.options?.rules?.length || 0;

  return (
    <Card id="tour-bundle-compact" $p="md" $bg="bg.surfaceHover">
      <Flex $direction="column" $gap="md">
        <Flex $justify="space-between" $align="center">
          <Flex $align="center" $gap="sm">
            <Package size={16} color={theme.colors.palette.primary.light} />
            <Text $weight="bold" $size="sm">{activeBundle.name}</Text>
          </Flex>
          
          <Button $variant="icon" onClick={toggleHideBarrelExports} title="Toggle Barrel Exports">
            {hideBarrelExports ? <EyeOff size={14} color={theme.colors.palette.primary.main} /> : <Eye size={14} />}
          </Button>
        </Flex>
        
        <Flex $gap="sm">
          <Flex $bg="bg.overlay" $p="xs sm" $radius="sm" $gap="xs" $align="center" style={{ border: `1px solid ${theme.colors.border.subtle}` }}>
            <FileCode size={12} color={theme.colors.palette.success.main} />
            <Text $size="xs" $weight="bold">{fileCount} Files</Text>
          </Flex>
          <Flex $bg="bg.overlay" $p="xs sm" $radius="sm" $gap="xs" $align="center" style={{ border: `1px solid ${theme.colors.border.subtle}` }}>
            <ShieldAlert size={12} color={theme.colors.palette.warning.main} />
            <Text $size="xs" $weight="bold">{ruleCount} Rules</Text>
          </Flex>
        </Flex>

        <Button 
          $variant="primary" 
          $fill 
          onClick={generateAndCopyBundle} 
          disabled={isGenerating || fileCount === 0}
        >
          <Flex $align="center" $justify="center" $gap="sm">
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
            <Text $weight="bold">{isGenerating ? "Bundling..." : "Generate Context"}</Text>
          </Flex>
        </Button>
      </Flex>
    </Card>
  );
};
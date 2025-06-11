import { memo, useMemo } from 'react';
import { HStack, Text, Icon, Tooltip } from '@chakra-ui/react';
import { IconType } from 'react-icons';

type ResourceProps = {
  icon: IconType;
  value: number;
  label: string;
  color: string;
  showLabel?: boolean;
};

const Resource = memo(({ 
  icon: IconComponent, 
  value, 
  label, 
  color = 'white',
  showLabel = true 
}: ResourceProps) => {
  const displayValue = useMemo(() => {
    // Format large numbers for better readability
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  }, [value]);

  return (
    <Tooltip label={label} isDisabled={showLabel} hasArrow>
      <HStack
        spacing={2}
        sx={{
          bg: 'rgba(0, 0, 0, 0.3)',
          px: 3,
          py: 1.5,
          borderRadius: 'full',
          border: '1px solid',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          _hover: { bg: 'rgba(255, 255, 255, 0.1)' },
          transition: 'all 0.2s',
          flexShrink: 0,
          minW: 'max-content',
        }}
      >
        <Icon as={IconComponent} color={color} boxSize={4} />
        <Text fontSize="sm" fontWeight="bold" whiteSpace="nowrap">
          {displayValue}
        </Text>
        {showLabel && (
          <Text 
            fontSize="xs" 
            opacity={0.8} 
            display={{ base: 'none', md: 'block' }}
            whiteSpace="nowrap"
          >
            {label}
          </Text>
        )}
      </HStack>
    </Tooltip>
  );
});

Resource.displayName = 'Resource';

export default Resource;

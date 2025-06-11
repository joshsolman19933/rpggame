import { Text, Flex, Icon } from '@chakra-ui/react';
import { FaFire, FaUsers, FaTrophy } from 'react-icons/fa';
import { FaDragon } from 'react-icons/fa';
import { useEffect } from 'react';

const NewsTicker = () => {
  const newsItems = [
    { 
      id: 1, 
      text: 'Új pályák érkeztek a játékba!', 
      icon: FaFire,
      color: 'red.400'
    },
    { 
      id: 2, 
      text: 'Most már 10.000+ játékos vár a csatában!',
      icon: FaUsers,
      color: 'blue.300'
    },
    { 
      id: 3, 
      text: 'Heti ranglisták frissültek!',
      icon: FaTrophy,
      color: 'yellow.400'
    },
    { 
      id: 4, 
      text: 'Új sárkány bosszújár a Birodalomban!',
      icon: FaDragon,
      color: 'red.500'
    }
  ];

  useEffect(() => {
    const ticker = document.querySelector('.ticker-container');
    if (ticker) {
      const scrollTicker = () => {
        if (ticker.scrollLeft >= ticker.scrollWidth / 2) {
          ticker.scrollLeft = 0;
        } else {
          ticker.scrollLeft += 1;
        }
      };
      
      const interval = setInterval(scrollTicker, 30);
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <Flex 
      className="ticker-container"
      alignItems="center" 
      h="100%"
      overflowX="auto"
      overflowY="hidden"
      px={4}
      bg="gray.800"
      borderBottom="1px solid"
      borderColor="gray.700"
      css={{
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        '-ms-overflow-style': 'none',
        'scrollbar-width': 'none',
      }}
    >
      <Flex 
        alignItems="center" 
        h="100%"
        color="white"
        whiteSpace="nowrap"
        animation={`ticker 20s linear infinite`}
        css={{
          '@keyframes ticker': {
            '0%': { transform: 'translateX(100%)' },
            '100%': { transform: 'translateX(-100%)' },
          },
          '&:hover': {
            animationPlayState: 'paused',
          },
        }}
      >
        {[...newsItems, ...newsItems].map((item, index) => (
          <Flex key={`${item.id}-${index}`} alignItems="center" mr={10}>
            <Icon as={item.icon} color={item.color} mr={2} />
            <Text fontSize="sm" fontWeight="medium">{item.text}</Text>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};

export default NewsTicker;

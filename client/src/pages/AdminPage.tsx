import { Box } from '@chakra-ui/react';
import AdminDashboard from './AdminDashboard';

const AdminPage = () => {
  return (
    <Box minH="100vh" bg="gray.900" color="white">
      <AdminDashboard />
    </Box>
  );
};

export default AdminPage;

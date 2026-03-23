import React from 'react';
import {
  Card,
  CardContent,
  Typography
} from '@mui/material';

const StatsCard = ({ title, value, color }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h4" color={color}>{value}</Typography>
        <Typography variant="body2" color="textSecondary">{title}</Typography>
      </CardContent>
    </Card>
  );
};

export default StatsCard;

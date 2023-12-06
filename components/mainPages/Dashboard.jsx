import React, { useMemo } from 'react';
import Resources from '../dashboardBlocks/Resources.jsx';

const Dashboard = ({ data }) => {
  const slugs = useMemo(() => data.map((el) => el.slug), [data]);

  if (slugs?.includes('resources')) return <Resources />;

  return <></>;
};

export default Dashboard;

import { useEffect, useState } from 'react';

// material-ui
import { Grid } from '@mui/material';

// project imports
import EarningCard from '../../dashboard/Default/EarningCard';
import PopularCard from '../../dashboard/Default/PopularCard';
import TotalOrderLineChartCard from '../../dashboard/Default/TotalOrderLineChartCard';
import TotalIncomeDarkCard from '../../dashboard/Default/TotalIncomeDarkCard';
import TotalIncomeLightCard from '../../dashboard/Default/TotalIncomeLightCard';
import TotalGrowthBarChart from '../../dashboard/Default/TotalGrowthBarChart';
import { gridSpacing } from 'store/constant';

// ==============================|| DEFAULT DASHBOARD ||============================== //

const Dashboard = () => {
    const [isLoading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <Grid container spacing={gridSpacing}>
                    <Grid item lg={6} md={6} sm={6} xs={12}>
                        <EarningCard isLoading={isLoading} />
                    </Grid>
                    <Grid item lg={6} md={6} sm={6} xs={12}>
                        <TotalOrderLineChartCard isLoading={isLoading} />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Grid container spacing={gridSpacing}>
                    <Grid item xs={12} md={12}>
                        <PopularCard isLoading={isLoading} />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default Dashboard;

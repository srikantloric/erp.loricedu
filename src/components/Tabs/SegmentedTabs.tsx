
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab, { tabClasses } from '@mui/joy/Tab';

// Define props type
interface TabsSegmentedControlsProps {
    selectedTab: number;
    setSelectedTab: (value: number) => void;
}

const TabsSegmentedControls: React.FC<TabsSegmentedControlsProps> = ({ selectedTab, setSelectedTab }) => {


    return (
        <Tabs aria-label="tabs" defaultValue={0} sx={{ bgcolor: 'transparent' }}
            onChange={(event, newValue) => {
                if (typeof newValue === 'number') {
                    setSelectedTab(newValue);
                }
            }}
            value={selectedTab}
        >
            <TabList
                disableUnderline
                sx={{
                    p: 0.7,
                    gap: 0.5,
                    borderRadius: 'xl',
                    bgcolor: 'background.level1',
                    [`& .${tabClasses.root}[aria-selected="true"]`]: {
                        boxShadow: 'sm',
                        bgcolor: 'background.surface',
                        color: '#175EA5',
                        fontWeight: "500"
                    },
                }}
            >
                <Tab disableIndicator value={0}>Overview</Tab>
                <Tab disableIndicator value={1}>Expenses</Tab>
                <Tab disableIndicator value={2}>Categories</Tab>
                <Tab disableIndicator value={3}>Vendors</Tab>
            </TabList>
        </Tabs>
    );
}
export default TabsSegmentedControls;
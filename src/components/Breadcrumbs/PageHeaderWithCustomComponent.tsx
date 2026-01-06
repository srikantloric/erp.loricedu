import { Divider, Stack, Typography } from "@mui/joy";
import { FC } from "react";

interface PageHeaderWithHelpButtonProps {
    title: string;
    component: React.ReactNode
}

const PageHeaderWithCustomComponent: FC<PageHeaderWithHelpButtonProps> = ({ title, component }) => {
    return (
        <>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography level="h4">{title}</Typography>
                {component && component}
            </Stack>
            <Divider sx={{ mt: 2 }} />
        </>
    );
};

export default PageHeaderWithCustomComponent;
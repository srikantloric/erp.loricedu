import { Button, Divider, Stack, Typography } from "@mui/joy";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import { FC } from "react";

interface PageHeaderWithHelpButtonProps {
    title: string;
}

const PageHeaderWithHelpButton: FC<PageHeaderWithHelpButtonProps> = ({ title }) => {
    return (
        <>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography level="h4">{title}</Typography>
                <Button size="sm" variant="outlined" startDecorator={<VideoLibraryIcon color="error" />}>
                    Help Video
                </Button>
            </Stack>
            <Divider sx={{ mt: 2 }} />
        </>
    );
};

export default PageHeaderWithHelpButton;
import { Box, Button, Card, Stack, Typography } from "@mui/joy";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import { FC, useState } from "react";

interface ExpenseCategory {
    id: string | number;
    name: string;
    description: string;
    subcategories?: string[];
}

interface ExpenseCategoryCardProps {
    category: ExpenseCategory;
}

const ExpenseCategoryCard: FC<ExpenseCategoryCardProps> = ({ category }) => {

    const [subcategoryShowing, setSubcategoriesShowing] = useState<boolean>(false)

    return (
        <>
            <Card size="sm" variant="outlined" sx={{ height: "100%" }} key={category.id}>
                <Stack direction="row" justifyContent="space-between" sx={{ height: "100%" }} alignItems="center">
                    <Stack>
                        <Typography level="h4">{category.name}</Typography>
                        <Typography level="body-sm">{category.description}</Typography>
                    </Stack>
                    <Button variant="soft" color="neutral"
                        endDecorator={<KeyboardArrowDown />}
                        sx={{ height: "100%" }}
                        onClick={() => setSubcategoriesShowing(!subcategoryShowing)}
                    >
                        Show Subcategories
                    </Button>
                </Stack>
            </Card>
            {
                subcategoryShowing &&
                <Stack spacing={1} pl={4}>
                    <Box
                        sx={{
                            border: "2px dashed #808080",
                            borderRadius: "8px",
                            padding: 1,
                            textAlign: "center",
                            cursor: "pointer",
                            transition: "border-color 0.3s ease-in-out",
                            "&:hover": {
                                borderColor: "#6686F7",
                                color:"#6686F7",
                                backgroundColor:"rgba(120, 183, 245, 0.17)"
                            },
                        }}
                        onClick={() => console.log("Box clicked")}
                    >
                        <Typography level="title-md" sx={{color:"#808080"}} >Add New Subcategory</Typography>
                    </Box>
                    {category.subcategories?.map((subItem, index) => (
                        <Card key={index} size="sm" variant="outlined" sx={{ height: "100%", ml: 6 }}>
                            <Stack direction="row" justifyContent="space-between" sx={{ height: "100%" }} alignItems="center">
                                <Stack>
                                    <Typography level="body-md">{subItem}</Typography>
                                </Stack>
                            </Stack>
                        </Card>
                    ))}
                </Stack >
            }
        </>
    );
};

export default ExpenseCategoryCard;
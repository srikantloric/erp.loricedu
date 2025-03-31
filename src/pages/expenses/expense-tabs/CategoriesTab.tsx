import { Add,  Search } from "@mui/icons-material"
import { Button,  Input, Stack } from "@mui/joy"
import ExpenseCategoryCard from "components/Card/ExpenseCategoryCard"
import { ExpenseCatSubCatData } from "utilities/ExpenseCategories"



function CategoriesTab() {

    return (
        <>
            <Stack
                justifyContent={"space-between"}
                direction={"row"}
                mt={2}
            >
                <Input
                    startDecorator={<Search />}
                    sx={{ flex: 0.6, p: 1.1 }}
                    placeholder="Search expense id,reciever or subcategory..."
                ></Input>

                <Stack
                    direction={"row"}
                >
                    <Button startDecorator={<Add />}>Add Categories</Button>
                </Stack>
            </Stack>
            <br />
            <Stack
                spacing={2}
            >
                {
                    ExpenseCatSubCatData.map((item) => {
                        return (
                           <ExpenseCategoryCard category={item}/>
                        )
                    })
                }

            </Stack>

        </>
    )
}

export default CategoriesTab
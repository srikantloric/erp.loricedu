import MaterialTable from "@material-table/core"
import { Add, Edit, Search, Visibility } from "@mui/icons-material"
import { Avatar, Button, Chip, Input, LinearProgress, Stack, Typography } from "@mui/joy"
import { Box } from "@mui/material"
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton"
import EditUserDetailsModal from "components/Modals/user-management/EditUserDetailsModal"

import { enqueueSnackbar } from "notistack"

import { useEffect, useState } from "react"
import { Users } from "types/Users"
import { getUsers } from "utils/user-management/getUsers"
import { updateUser } from "utils/user-management/updateUser"

function UserManagement() {

    const [users, setUsers] = useState<Users[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [editUserModalOpen, setEditUserModalOpen] = useState<boolean>(false)
    const [selectedUser, setSelectedUser] = useState<Users | null>(null)

    const usersTableColumns = [
        {
            title: "Id", field: "email",
            render: (row: Users) => {
                return (
                    <Stack>
                        <Avatar alt={row.name} src={row.profile}></Avatar>
                    </Stack>
                )
            }
        },
        { title: "User ID", field: "email" },
        { title: "User Name", field: "name" },
        {
            title: "User Type", field: "role",
            render: (row: Users) => {
                return (
                    <Chip color="success">{row.role}</Chip>
                )
            }
        },
        {
            title: "Created At", field: "createdAt",
            render: (row: Users) => {
                return (
                    <Typography>{row.createdAt?.toDate().toLocaleString()}</Typography>
                )
            }
        },
        {
            title: "Last Updated", field: "updatedAt",
            render: (row: Users) => {
                return (
                    <Typography>{row.updatedAt ? row.createdAt?.toDate().toLocaleString() : "N/A"}</Typography>
                )
            }
        },
    ]
    const fetchAdminUsers = async () => {
        setLoading(true)
        try {
            const users = await getUsers();
            setUsers(users);
        } catch (err) {
            console.log(err)
            enqueueSnackbar("Error while fetching users!", { variant: "error" })
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchAdminUsers();
    }, []);

    const handleFormSubmit = async (data: any) => {
        try {
            await updateUser(selectedUser?.id!, data);
            fetchAdminUsers()
            enqueueSnackbar("User details updated successfully!", { variant: "success" })
        } catch (err) {
            console.error(err);
            alert("Failed to update user");
        }
    }

    return (
        <>

            <PageHeaderWithHelpButton title="User Management" />
            <Stack
                justifyContent={"space-between"}
                direction={"row"}
                mt={2}

            >
                <Input
                    startDecorator={<Search
                    />}
                    sx={{ flex: 0.6, p: 1.1 }}
                    placeholder="Search userid, email, name..."
                ></Input>

                <Stack
                    direction={"row"}
                >
                    <Button startDecorator={<Add />}>Add User</Button>
                </Stack>
            </Stack>
            <br />
            {loading && <LinearProgress />}
            <Box
                sx={{ border: "1px solid oklch(.900 .013 255.508)", borderRadius: "10px", padding: "4px", mt: 1 }}
            >
                <MaterialTable
                    style={{ display: "grid", boxShadow: "none" }}
                    columns={usersTableColumns}
                    data={users}
                    options={{
                        search: false,
                        grouping: true,
                        headerStyle: {
                            backgroundColor: "#F4F4F4",
                            paddingLeft: "1rem",
                            paddingRight: "1rem",
                            paddingTop: "0.5rem",
                            paddingBottom: "0.5rem",
                            margin: 1
                        },
                        actionsColumnIndex: -1,
                    }}
                    actions={[
                        {
                            icon: () => <Edit sx={{ color: "var(--bs-primary)" }} />,
                            tooltip: "Edit User Details",
                            onClick: (event, rowData) => {
                                setSelectedUser(rowData as Users)
                                setEditUserModalOpen(true)
                            },
                        },
                        {
                            icon: () => <Visibility sx={{ color: "var(--bs-primary)" }} />,
                            tooltip: "View Details",
                            onClick: (event, rowData) => {
                                //To Do
                            },
                        },

                    ]
                    }
                />
            </Box>
            {
                selectedUser &&
                <EditUserDetailsModal onSubmitForm={handleFormSubmit} user={selectedUser} open={editUserModalOpen} onClose={() => setEditUserModalOpen(false)} />
            }
        </>
    )
}

export default UserManagement
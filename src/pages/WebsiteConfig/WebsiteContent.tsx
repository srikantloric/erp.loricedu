import {
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import { SchoolInfo } from "types/schoolInfo";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";

const WebsiteContent = () => {
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [formData, setFormData] = useState<
    Partial<SchoolInfo & { [key: string]: any }>
  >({});
  const [editMode, setEditMode] = useState({
    schoolInfo: false,
    noticeNews: false,
    aboutUs: false,
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [newNotice, setNewNotice] = useState({
    noticeContent: "",
    createdAt: "",
  });
  const [editNoticeIndex, setEditNoticeIndex] = useState<number | null>(null);
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [newMessage, setNewMessage] = useState({
    messageTitle: "",
    messageContent: "",
    messageBy: "",
    highlightedMessage: "",
  });
  const [editMessageIndex, setEditMessageIndex] = useState<number | null>(null);

   //Get Firebase DB instance
   const {db} = useFirebase();


  useEffect(() => {
    const getSchoolInfo = async () => {
      try {
        const docRef = doc(db, "WEBSITE_CONFIG", "websiteConfig");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const schoolData = docSnap.data();
          if (schoolData) {
            setSchoolInfo(schoolData as SchoolInfo);
            setFormData(schoolData as SchoolInfo);
          }
        } else {
          console.log("No such document found");
        }
      } catch (error) {
        console.error("Error fetching school info:", error);
      }
    }
    getSchoolInfo();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const keys = name.split(".");
    if (keys.length > 1) {
      setFormData((prev) => {
        let updatedData = { ...prev };
        let temp = updatedData;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!temp[keys[i]]) temp[keys[i]] = {};
          temp = temp[keys[i]];
        }
        temp[keys[keys.length - 1]] =
          keys[keys.length - 1] === "phoneNumbers"
            ? value.split(",").map((num) => num.trim())
            : value;
        return updatedData;
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleEditMode = (section: string, mode: boolean) => {
    setEditMode((prev) => ({ ...prev, [section]: mode }));
  };

  const handleSubmit = async (e: React.FormEvent, section: string) => {
    e.preventDefault();
    try {
      if (schoolInfo) {
        const docRef = doc(db, "WEBSITE_CONFIG", "websiteConfig");
        await updateDoc(docRef, formData);

        setSchoolInfo({ ...schoolInfo, ...formData });
        handleEditMode(section, false);
      }
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  const handleDialogOpen = () => {
    setNewNotice({
      noticeContent: "",
      createdAt: new Date().toString().split("T")[0] || "",
    });
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditNoticeIndex(null);
  };

  const handleNewNoticeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewNotice((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddNotice = async () => {
    const updatedNotices = [...(formData.noticeBoard || []), newNotice];
    setFormData((prev) => ({
      ...prev,
      noticeBoard: updatedNotices,
    }));
    try {
      const docRef = doc(db, "WEBSITE_CONFIG", "websiteConfig");
      await updateDoc(docRef, { noticeBoard: updatedNotices });
    } catch (error) {
      console.error("Error updating notices:", error);
    }
    handleDialogClose();
  };

  const handleEditNoticeDialogOpen = (index: number) => {
    setEditNoticeIndex(index);
    const notice = formData.noticeBoard?.[index];
    setNewNotice(
      notice
        ? {
          noticeContent: notice.noticeContent,
          createdAt: new Date(notice.createdAt).toISOString().split("T")[0],
        }
        : {
          noticeContent: "",
          createdAt: new Date().toISOString().split("T")[0],
        }
    );
    setOpenDialog(true);
  };

  const handleEditNotice = async () => {
    if (editNoticeIndex !== null) {
      const updatedNotices = formData.noticeBoard?.map((notice, index) =>
        index === editNoticeIndex ? newNotice : notice
      );
      setFormData((prev) => ({
        ...prev,
        noticeBoard: updatedNotices,
      }));
      try {
        const docRef = doc(db, "WEBSITE_CONFIG", "websiteConfig");
        await updateDoc(docRef, { noticeBoard: updatedNotices });
        console.log("Notice board updated successfully!");
      } catch (error) {
        console.error("Error updating notice board:", error);
      }
      handleDialogClose();
    }
  };

  const handleDeleteNotice = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      noticeBoard: prev.noticeBoard?.filter((_, i) => i !== index),
    }));
  };

  const handleMessageDialogOpen = () => {
    setOpenMessageDialog(true);
  };

  const handleMessageDialogClose = () => {
    setOpenMessageDialog(false);
    setEditMessageIndex(null);
  };

  const handleNewMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMessage((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddMessage = async () => {
    const updatedMessages = [...(formData.aboutUs?.messages || []), newMessage];
    setFormData((prev) => ({
      ...prev,
      aboutUs: {
        ...prev.aboutUs,
        messages: updatedMessages,
      },
    }));
    try {
      const docRef = doc(db, "WEBSITE_CONFIG", "websiteConfig");
      await updateDoc(docRef, { "aboutUs.messages": updatedMessages });
      console.log("About Us messages updated successfully!");
    } catch (error) {
      console.error("Error updating About Us messages:", error);
    }
    handleMessageDialogClose();
  };

  const handleEditMessageDialogOpen = (index: number) => {
    setEditMessageIndex(index);
    setNewMessage(
      formData.aboutUs?.messages[index] || {
        messageTitle: "",
        messageContent: "",
        messageBy: "",
        highlightedMessage: "",
      }
    );
    setOpenMessageDialog(true);
  };

  const handleEditMessage = async () => {
    if (editMessageIndex !== null) {
      const updatedMessages = formData.aboutUs?.messages.map((message, index) =>
        index === editMessageIndex ? newMessage : message
      );
      setFormData((prev) => ({
        ...prev,
        aboutUs: {
          ...prev.aboutUs,
          messages: updatedMessages,
        },
      }));
      try {
        const docRef = doc(db, "WEBSITE_CONFIG", "websiteConfig");
        await updateDoc(docRef, { "aboutUs.messages": updatedMessages });
        console.log("About Us messages updated successfully!");
      } catch (error) {
        console.error("Error updating About Us messages:", error);
      }
      handleMessageDialogClose();
    }
  };

  const handleDeleteMessage = async (index: number) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      const updatedMessages = formData.aboutUs?.messages.filter(
        (_, i) => i !== index
      );
      setFormData((prev) => ({
        ...prev,
        aboutUs: {
          ...prev.aboutUs,
          messages: updatedMessages,
        },
      }));
      try {
        const docRef = doc(db, "WEBSITE_CONFIG", "websiteConfig");
        await updateDoc(docRef, { "aboutUs.messages": updatedMessages });
        console.log("About Us messages updated successfully!");
      } catch (error) {
        console.error("Error updating About Us messages:", error);
      }
    }
  };

  return (
    <>
      <Typography variant="h4">Update School Info</Typography>
      <Typography variant="caption">Update School Details</Typography>

      <Paper
        sx={{
          padding: "16px",
          color: "#000",
          my: 5,
        }}
      >
        <form onSubmit={(e) => handleSubmit(e, "schoolInfo")}>
          <Typography variant="h5">School Info</Typography>
          <Typography variant="caption">School basic details</Typography>

          <Divider sx={{ mt: 2, mb: 5 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                School Name
              </Typography>
              <TextField
                label="School Name"
                name="schoolName"
                value={formData.schoolName || ""}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                disabled={!editMode.schoolInfo}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                School Address
              </Typography>
              <TextField
                label="School Address"
                name="schoolAddress"
                value={formData.schoolAddress || ""}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                disabled={!editMode.schoolInfo}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Email
              </Typography>
              <TextField
                label="Email"
                name="contactDetails.email"
                value={formData.contactDetails?.email || ""}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                disabled={!editMode.schoolInfo}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Phone Numbers
              </Typography>
              <TextField
                label="Phone Numbers"
                name="contactDetails.phoneNumbers"
                value={
                  Array.isArray(formData.contactDetails?.phoneNumbers)
                    ? formData?.contactDetails?.phoneNumbers?.join(", ")
                    : ""
                }
                onChange={handleChange}
                variant="outlined"
                fullWidth
                disabled={!editMode.schoolInfo}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
            {editMode.schoolInfo ? (
              <>
                <Grid item>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleEditMode("schoolInfo", false)}
                  >
                    Cancel
                  </Button>
                </Grid>
                <Grid item>
                  <Button variant="contained" color="primary" type="submit">
                    Save
                  </Button>
                </Grid>
              </>
            ) : (
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleEditMode("schoolInfo", true)}
                >
                  Edit
                </Button>
              </Grid>
            )}
          </Grid>
        </form>
      </Paper>

      <Paper
        sx={{
          padding: "16px",
          color: "#000",
          mb: 5,
        }}
      >
        <form onSubmit={(e) => handleSubmit(e, "noticeNews")}>
          <Typography variant="h5">Notice & News</Typography>
          <Typography variant="caption">
            Update Notice & News Details
          </Typography>

          <Divider sx={{ mt: 2, mb: 5 }} />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Latest News
              </Typography>
              <TextField
                label="Latest News"
                name="latestNews"
                value={formData.latestNews || ""}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                disabled={!editMode.noticeNews}
              />
            </Grid>

            <Grid
              container
              spacing={2}
              justifyContent="flex-end"
              sx={{ mt: 2 }}
            >
              {editMode.noticeNews ? (
                <>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleEditMode("noticeNews", false)}
                    >
                      Cancel
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="contained" color="primary" type="submit">
                      Save
                    </Button>
                  </Grid>
                </>
              ) : (
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleEditMode("noticeNews", true)}
                  >
                    Edit
                  </Button>
                </Grid>
              )}
            </Grid>

            <Grid item xs={12} sx={{ mt: 5 }}>
              <Typography variant="h6">Notices</Typography>
              <Typography variant="caption">Notice For Notice Board</Typography>
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Notice Content</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.noticeBoard?.map((notice, index) => (
                      <TableRow key={index}>
                        <TableCell>{notice.noticeContent}</TableCell>
                        <TableCell>
                          {notice.createdAt.toString().split("T")[0]}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleEditNoticeDialogOpen(index)}
                          >
                            <EditIcon color="primary" />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteNotice(index)}>
                            <DeleteIcon color="error" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
          <Grid container spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={handleDialogOpen}
              >
                <AddIcon /> Add Notice
              </Button>
            </Grid>
          </Grid>
        </form>

        <Dialog open={openDialog} onClose={handleDialogClose}>
          <DialogTitle>
            {editNoticeIndex !== null ? "Edit Notice" : "Add New Notice"}
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Notice Content"
              name="noticeContent"
              value={newNotice.noticeContent}
              onChange={handleNewNoticeChange}
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
            />
            {editNoticeIndex !== null && (
              <TextField
                label="Date"
                name="createdAt"
                type="date"
                value={newNotice.createdAt}
                onChange={handleNewNoticeChange}
                variant="outlined"
                fullWidth
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="secondary">
              Cancel
            </Button>
            <Button
              onClick={
                editNoticeIndex !== null ? handleEditNotice : handleAddNotice
              }
              color="primary"
            >
              {editNoticeIndex !== null ? "Save" : "Add"}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>

      {/* <Divider sx={{ my: 2 }} /> */}

      <Paper
        sx={{
          padding: "16px",
          color: "#000",
          mb: 5,
        }}
      >
        <form onSubmit={(e) => handleSubmit(e, "aboutUs")}>
          <Typography variant="h5">About Us Page</Typography>
          <Typography variant="caption">
            Update About-us Page Details
          </Typography>

          <Divider sx={{ mt: 2, mb: 5 }} />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Inspirational Quote
              </Typography>
              <TextField
                label="Inspirational Quote"
                name="aboutUs.inspirationalQuote.inspirationalQuoteMessage"
                value={
                  formData.aboutUs?.inspirationalQuote
                    .inspirationalQuoteMessage || ""
                }
                onChange={handleChange}
                variant="outlined"
                fullWidth
                disabled={!editMode.aboutUs}
              />
            </Grid>
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Quote Author
              </Typography>
              <TextField
                label="Quote Author"
                name="aboutUs.inspirationalQuote.inspirationalQuoteAuthor"
                value={
                  formData.aboutUs?.inspirationalQuote
                    .inspirationalQuoteAuthor || ""
                }
                onChange={handleChange}
                variant="outlined"
                fullWidth
                disabled={!editMode.aboutUs}
              />
            </Grid>
            <Grid
              container
              spacing={2}
              justifyContent="flex-end"
              sx={{ mt: 3 }}
            >
              {editMode.aboutUs ? (
                <>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleEditMode("aboutUs", false)}
                    >
                      Cancel
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="contained" color="primary" type="submit">
                      Save
                    </Button>
                  </Grid>
                </>
              ) : (
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleEditMode("aboutUs", true)}
                  >
                    Edit
                  </Button>
                </Grid>
              )}
            </Grid>

            <Grid item xs={12} sx={{ mt: 5 }}>
              <Typography variant="h6">Messages</Typography>
              <Typography variant="caption">
                Messages For About-us Page
              </Typography>
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Message Title</TableCell>
                      <TableCell>Message Content</TableCell>
                      <TableCell>Message By</TableCell>
                      <TableCell>Highlighted Message</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.aboutUs?.messages.map((message, index) => (
                      <TableRow key={index}>
                        <TableCell>{message.messageTitle}</TableCell>
                        <TableCell>{message.messageContent}</TableCell>
                        <TableCell>{message.messageBy}</TableCell>
                        <TableCell>{message.highlightedMessage}</TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleEditMessageDialogOpen(index)}
                          >
                            <EditIcon color="primary" />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteMessage(index)}
                          >
                            <DeleteIcon color="error" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
          <Grid container spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={handleMessageDialogOpen}
              >
                <AddIcon /> Add Message
              </Button>
            </Grid>
          </Grid>
        </form>

        <Dialog open={openMessageDialog} onClose={handleMessageDialogClose}>
          <DialogTitle>
            {editMessageIndex !== null ? "Edit Message" : "Add New Message"}
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Message Title"
              name="messageTitle"
              value={newMessage.messageTitle}
              onChange={handleNewMessageChange}
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Message Content"
              name="messageContent"
              value={newMessage.messageContent}
              onChange={handleNewMessageChange}
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Message By"
              name="messageBy"
              value={newMessage.messageBy}
              onChange={handleNewMessageChange}
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Highlighted Message"
              name="highlightedMessage"
              value={newMessage.highlightedMessage}
              onChange={handleNewMessageChange}
              variant="outlined"
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleMessageDialogClose} color="secondary">
              Cancel
            </Button>
            <Button
              onClick={
                editMessageIndex !== null ? handleEditMessage : handleAddMessage
              }
              color="primary"
            >
              {editMessageIndex !== null ? "Save" : "Add"}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </>
  );
};

export default WebsiteContent;

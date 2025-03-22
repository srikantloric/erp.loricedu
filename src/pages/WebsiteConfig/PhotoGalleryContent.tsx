import {
  Button,
  Paper,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
} from "@mui/material";
import { useEffect, useState } from "react";
import { PhotoGalleryCategory } from "types/gallery";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { Formik, Form, Field } from "formik";
import { photoGallerySchema } from "./validationSchemas";
import Confirmation from "../../utilities/Confirmation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";

const PhotoGalleryContent = () => {
  const [formData, setFormData] = useState<Partial<PhotoGalleryCategory>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editEventData, setEditEventData] = useState<
    Partial<PhotoGalleryCategory>
  >({});
  const [editImagesDialogOpen, setEditImagesDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteEventIndex, setDeleteEventIndex] = useState<number | null>(null);

   //Get Firebase DB instance
   const {db} = useFirebase();

  useEffect(() => {
    const getPhotoGalleryData = async () => {
      try {
        const docRef = doc(db, "WEBSITE_CONFIG", "photoGallary");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const galleryData = docSnap.data()?.events as PhotoGalleryCategory[];
          setFormData(galleryData);
        } else {
          console.log("No such document found");
        }
      } catch (err) {
        console.error("Error fetching photo gallery data:", err);
        setError("Failed to fetch photo gallery data.");
      }
    };

    getPhotoGalleryData();
  }, []);

  const handleRowClick = (index: number) => {
    setEditEventData(formData[index]);
    setEditImagesDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setEditEventData({});
  };

  const handleEditImagesDialogClose = () => {
    setEditImagesDialogOpen(false);
    setEditEventData({});
  };

  const handleAddDialogClose = () => {
    setAddDialogOpen(false);
  };
  const handleSaveEditEvent = async (values: Partial<PhotoGalleryCategory>) => {
    try {
      const updatedData = formData.map((event) =>
        event.eventId === values.eventId ? values : event
      );
  
      setFormData(updatedData);
  
      const docRef = doc(db, "WEBSITE_CONFIG", "photoGallary");
      await setDoc(docRef, { events: updatedData });
  
      setEditDialogOpen(false);
      setEditEventData({});
      setError(null);
    } catch (err) {
      console.error("Error saving edited event:", err);
      setError("Failed to save edited event.");
    }
  };
  
  const handleAddNewEvent = async (values: Partial<PhotoGalleryCategory>) => {
    try {
      const updatedData = [
        ...formData,
        {
          ...values,
          eventId: values.eventId || "",
          eventThumbnail: values.eventThumbnail || "",
          images: values.images || [{ imageUrl: "" }],
        } as PhotoGalleryCategory,
      ];
  
      setFormData(updatedData);
  
      const docRef = doc(db, "WEBSITE_CONFIG", "photoGallary");
      await setDoc(docRef, { events: updatedData });
  
      setAddDialogOpen(false);
      setError(null);
    } catch (err) {
      console.error("Error adding new photo event:", err);
      setError("Failed to add new photo event.");
    }
  };

  const handleDeleteImageFromEdit = (imageIndex: number) => {
    setEditEventData((prev) => {
      const updatedImages = (prev.images || []).filter(
        (_, index) => index !== imageIndex
      );
      return { ...prev, images: updatedImages };
    });
  };

  const handleAddImageToEdit = () => {
    setEditEventData((prev) => ({
      ...prev,
      images: [...(prev.images || []), { imageUrl: "" }],
    }));
  };

  const handleEditEventChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    imageIndex: number
  ) => {
    const { value } = e.target;
    setEditEventData((prev) => {
      const updatedImages = (prev.images || []).map((image, index) =>
        index === imageIndex ? { ...image, imageUrl: value } : image
      );
      return { ...prev, images: updatedImages };
    });
  };

  const handleEditContentDialogOpen = (index: number) => {
    setEditEventData(formData[index]);
    setEditDialogOpen(true);
  };

  const handleAddPhotoEvent = () => {
    setAddDialogOpen(true);
  };

  const handleDeleteEvent = async () => {
    if (deleteEventIndex !== null) {
      try {
        const updatedData = formData.filter(
          (_, index) => index !== deleteEventIndex
        );
  
        setFormData(updatedData);
  
        const docRef = doc(db, "WEBSITE_CONFIG", "photoGallary");
        await setDoc(docRef, { events: updatedData });
  
        setDeleteDialogOpen(false);
        setDeleteEventIndex(null);
        setError(null);
      } catch (err) {
        console.error("Error deleting event:", err);
        setError("Failed to delete event.");
      }
    }
  };

  const handleDeleteDialogOpen = (index: number) => {
    setDeleteEventIndex(index);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setDeleteEventIndex(null);
  };

  return (
    <div>
      <Typography variant="h4">Photo Gallery</Typography>
      <Typography variant="caption">Update Photo Gallery Details</Typography>

      <Paper
        sx={{
          padding: "16px",
          color: "#000",
          my: 5,
        }}
      >
        {error && (
          <Typography variant="body1" color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Grid container spacing={2} justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddPhotoEvent}
            sx={{ my: 2 }}
          >
            Add Photo Event
          </Button>
        </Grid>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Event ID</TableCell>
                <TableCell>Event Title</TableCell>
                <TableCell>Event Thumbnail</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Event Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.map((photo, index) => (
                <TableRow
                  key={index}
                  onClick={() => handleRowClick(index)}
                  style={{ cursor: "pointer" }}
                >
                  <TableCell>{photo.eventId}</TableCell>
                  <TableCell>{photo.eventTitle}</TableCell>
                  <TableCell>{photo.eventThumbnail}</TableCell>
                  <TableCell>{photo.description}</TableCell>
                  <TableCell>
                    {photo.eventDate?.toString().split("T")[0]}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      aria-label="edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditContentDialogOpen(index);
                      }}
                    >
                      <EditIcon color="primary" />
                    </IconButton>
                    <IconButton
                      aria-label="delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDialogOpen(index);
                      }}
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={editDialogOpen}
        onClose={handleEditDialogClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Edit Event</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={editEventData}
            validationSchema={photoGallerySchema}
            onSubmit={handleSaveEditEvent}
          >
            {({ errors, touched }) => (
              <Form>
                <Field
                  as={TextField}
                  autoFocus
                  margin="dense"
                  name="eventId"
                  label="Event ID"
                  type="text"
                  fullWidth
                  error={touched.eventId && !!errors.eventId}
                  helperText={touched.eventId && errors.eventId}
                />
                <Field
                  as={TextField}
                  margin="dense"
                  name="eventTitle"
                  label="Event Title"
                  type="text"
                  fullWidth
                  error={touched.eventTitle && !!errors.eventTitle}
                  helperText={touched.eventTitle && errors.eventTitle}
                />
                <Field
                  as={TextField}
                  margin="dense"
                  name="eventThumbnail"
                  label="Event Thumbnail URL"
                  type="text"
                  fullWidth
                  error={touched.eventThumbnail && !!errors.eventThumbnail}
                  helperText={touched.eventThumbnail && errors.eventThumbnail}
                />
                <Field
                  as={TextField}
                  margin="dense"
                  name="description"
                  label="Description"
                  type="text"
                  fullWidth
                  error={touched.description && !!errors.description}
                  helperText={touched.description && errors.description}
                />
                <Field
                  as={TextField}
                  margin="dense"
                  name="eventDate"
                  label="Event Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  error={touched.eventDate && !!errors.eventDate}
                  helperText={touched.eventDate && errors.eventDate}
                />
                <DialogActions>
                  <Button onClick={handleEditDialogClose} color="primary">
                    Cancel
                  </Button>
                  <Button type="submit" color="primary">
                    Save
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editImagesDialogOpen}
        onClose={handleEditImagesDialogClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Edit Event Images</DialogTitle>

        <Grid container spacing={2} sx={{ my: 2 }}>
          Event Id: {editEventData.eventId}
        </Grid>

        <DialogContent>
          <Grid container spacing={2} justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddImageToEdit}
              sx={{ mt: 2, mb: 2 }}
            >
              Add Image
            </Button>
          </Grid>
          <Typography variant="h6" sx={{ mt: 2 }}>
            Images:
          </Typography>
          <Grid container spacing={2}>
            {editEventData.images?.map((image, imageIndex) => (
              <Grid item xs={12} sm={4} key={imageIndex}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <TextField
                    margin="dense"
                    name="imageUrl"
                    label={`Image URL ${imageIndex + 1}`}
                    type="text"
                    fullWidth
                    value={image.imageUrl}
                    onChange={(e) => handleEditEventChange(e, imageIndex)}
                  />
                  <IconButton
                    aria-label="delete"
                    onClick={() => handleDeleteImageFromEdit(imageIndex)}
                  >
                    <DeleteIcon color="error" />
                  </IconButton>
                </div>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditImagesDialogClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => handleSaveEditEvent(editEventData)}
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add New Event Block */}
      <Dialog
        open={addDialogOpen}
        onClose={handleAddDialogClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Add New Event</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              eventId: "",
              eventTitle: "",
              eventThumbnail: "",
              description: "",
              eventDate: new Date(),
              images: [{ imageUrl: "" }],
            }}
            validationSchema={photoGallerySchema}
            onSubmit={handleAddNewEvent}
          >
            {({ errors, touched }) => (
              <Form>
                <Field
                  as={TextField}
                  autoFocus
                  margin="dense"
                  name="eventId"
                  label="Event ID"
                  type="text"
                  fullWidth
                  error={touched.eventId && !!errors.eventId}
                  helperText={touched.eventId && errors.eventId}
                />
                <Field
                  as={TextField}
                  margin="dense"
                  name="eventTitle"
                  label="Event Title"
                  type="text"
                  fullWidth
                  error={touched.eventTitle && !!errors.eventTitle}
                  helperText={touched.eventTitle && errors.eventTitle}
                />
                <Field
                  as={TextField}
                  margin="dense"
                  name="eventThumbnail"
                  label="Event Thumbnail URL"
                  type="text"
                  fullWidth
                  error={touched.eventThumbnail && !!errors.eventThumbnail}
                  helperText={touched.eventThumbnail && errors.eventThumbnail}
                />
                <Field
                  as={TextField}
                  margin="dense"
                  name="description"
                  label="Description"
                  type="text"
                  fullWidth
                  error={touched.description && !!errors.description}
                  helperText={touched.description && errors.description}
                />
                <Field
                  as={TextField}
                  margin="dense"
                  name="eventDate"
                  label="Event Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  error={touched.eventDate && !!errors.eventDate}
                  helperText={touched.eventDate && errors.eventDate}
                />
                <DialogActions>
                  <Button onClick={handleAddDialogClose} color="primary">
                    Cancel
                  </Button>
                  <Button type="submit" color="primary">
                    Add
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

      <Confirmation
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleDeleteEvent}
        title="Delete Event"
        description="Are you sure you want to delete this event?"
      />
    </div>
  );
};

export default PhotoGalleryContent;

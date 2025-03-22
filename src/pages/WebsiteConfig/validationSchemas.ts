import * as Yup from "yup";

export const photoGallerySchema = Yup.object().shape({
    eventId: Yup.string().required("Event ID is required"),
    eventTitle: Yup.string().required("Event Title is required"),
    eventThumbnail: Yup.string().url("Invalid URL").required("Thumbnail URL is required"),
    description: Yup.string().required("Description is required"),
    eventDate: Yup.date().required("Event Date is required"),
});

export const videoGallerySchema = Yup.object().shape({
    eventId: Yup.string().required("Event ID is required"),
    eventTitle: Yup.string().required("Event Title is required"),
    eventThumbnail: Yup.string().url("Invalid URL").required("Thumbnail URL is required"),
    description: Yup.string().required("Description is required"),
    eventDate: Yup.date().required("Event Date is required"),
});

export interface PhotoGalleryCategory {
    eventId: string;
    eventTitle: string;
    description: string;
    eventThumbnail: string;
    eventDate: Date;
    images: {
        imageUrl: string;
    }[];
}

export interface VideoGalleryCategory {
    eventId: string;
    eventTitle: string;
    description: string;
    eventThumbnail: string;
    eventDate: Date;
    videos: {
        videoUrl: string;
    }[];
}

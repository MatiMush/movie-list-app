import mongoose, { Schema, Document, Types } from 'mongoose';

interface IListItem {
    tmdbId: number;
    title: string;
    poster?: string;
    year?: string;
    genre?: string;
    mediaType?: 'movie' | 'series';
    addedAt: Date;
}

export interface IList extends Document {
    userId: Types.ObjectId;
    sharedWith: Types.ObjectId[];
    name: string;
    items: IListItem[];
    createdAt: Date;
    updatedAt: Date;
}

const ListItemSchema = new Schema<IListItem>(
    {
        tmdbId: { type: Number, required: true },
        title: { type: String, required: true },
        poster: { type: String, default: '' },
        year: { type: String, default: '' },
        genre: { type: String, default: '' },
        mediaType: { type: String, enum: ['movie', 'series'], default: 'movie' },
        addedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const ListSchema = new Schema<IList>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 80,
        },
        sharedWith: {
            type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
            default: [],
        },
        items: {
            type: [ListItemSchema],
            default: [],
        },
    },
    { timestamps: true }
);

ListSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model<IList>('List', ListSchema);
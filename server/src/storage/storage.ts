import { randomUUID } from 'node:crypto';
import { supabaseAdmin } from '../config/supabaseClient.js';

const files = supabaseAdmin.storage.from('course-files');
const expiration = 60 * 60 * 24 * 7;

async function upload(folder: string, file: Express.Multer.File) {
    // keep in sync w/ getFileName() in client - src/components/tasks/taskTypes
    // (it strips the prefix UUID below)
    const safeName = file.originalname.replace(/[/\\]/g, '_');
    const path = `${folder}/${randomUUID()}-${safeName}`;

    const { error } = await files.upload(path, file.buffer, {
        contentType: file.mimetype,
    });

    if (error) throw error;
    return path;
}

function uploadTask(
    courseId: string,
    taskId: string,
    file: Express.Multer.File,
) {
    return upload(`course-${courseId}/tasks/${taskId}`, file);
}

function uploadSubmission(
    courseId: string,
    taskId: string,
    studentId: string,
    file: Express.Multer.File,
) {
    return upload(
        `course-${courseId}/submissions/${taskId}/${studentId}`,
        file,
    );
}

async function getFileUrl(path: string) {
    const { data, error } = await files.createSignedUrl(path, expiration);
    if (error) throw error;
    return data.signedUrl;
}

async function getFileUrls(paths: string[]) {
    if (paths.length === 0) return [];
    const { data, error } = await files.createSignedUrls(paths, expiration);
    if (error) throw error;
    return data.map((item) => item.signedUrl);
}

async function deleteFile(path: string) {
    const { error } = await files.remove([path]);
    if (error) throw error;
}

export { uploadTask, getFileUrl, getFileUrls, deleteFile, uploadSubmission };

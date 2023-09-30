import { RequestHandler } from "express";
import NoteModel from "../models/note";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import { assertIsDefined } from "../util/assertIsDefined";



export const getNotes: RequestHandler = async (req, res, next) => {
  const userId = req.session.userId;
  try {
    assertIsDefined(userId);

    const notes = await NoteModel.find({userId: userId}).exec();
    res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
}


export const getNote: RequestHandler = async (req, res, next) => {
  const noteId = req.params.NoteId;
  const userId = req.session.userId;

  try {
    assertIsDefined(userId);

    if (!mongoose.isValidObjectId(noteId)) {
      throw createHttpError(400, "Invalid note id");
    }

    const note = await NoteModel.findById(noteId).exec();
    
    if(!note){
      throw createHttpError(404, "Note not found");
    }

    if(note.userId !== userId){
      throw createHttpError(401, "You cannot access this note");
    
    }
    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
}

interface CreateNoteBody {
  title?: string;
  text?: string;
}

export const createNote: RequestHandler<unknown, unknown, CreateNoteBody, unknown> = async (req, res, next) => {
  const title = req.body.title;
  const text = req.body.text;
  const userId = req.session.userId;
  try {
    assertIsDefined(userId);
    if(!title){
      throw createHttpError(400, "Title is required");
    }

    const newNote = await NoteModel.create({
      title: title,
      text: text,
      userId: userId,
    });
    res.status(201).json(newNote);
  } catch (error) {
    next(error);
  }

}

interface UpdateNoteParams{
  noteId: string;
}

interface UpdateNoteBody{
  title?: string;
  text?: string;
}

export const updateNote: RequestHandler<UpdateNoteParams, unknown, UpdateNoteBody, unknown> = async (req, res, next) => {
  const noteId = req.params.noteId;
  const newTitle = req.body.title;
  const newText = req.body.text;
  const userId = req.session.userId;
  try {
    assertIsDefined(userId);

    if (!mongoose.isValidObjectId(noteId)){
      throw createHttpError(400, "Invalid note id");
    }

    if(!newTitle){
      throw createHttpError(400, "Title is required!!!");
    }

    const note = await NoteModel.findById(noteId).exec();

    if(!note){
      throw createHttpError(404, "Note not found");
    }
    if(note.userId !== userId){
      throw createHttpError(401, "You cannot access this note");
    }

    note.title = newTitle;
    note.text = newText;
    note.userId = userId;

    const updatedNote = await note.save();

    res.status(200).json(updatedNote);
  } catch (error) {
    next(error);
  }
}

export const deleteNote: RequestHandler =async (req, res, next) => {
  const noteId = req.params.noteId;
  const userId = req.session.userId;
  try {
    assertIsDefined(userId);

    if (!mongoose.isValidObjectId(noteId)) {
      throw createHttpError(400, "Invalid note id");
    }

    const note = await NoteModel.findById(noteId).exec();

    if (!note) {
      throw createHttpError(404, "Note not found");
    }

    if (note.userId !== userId) {
      throw createHttpError(401, "You cannot access this note");
    }
    // check this deleteOne
    await note.deleteOne();

    res.sendStatus(204);
  } catch (error) {
    next(error)
  }  
}
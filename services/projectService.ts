import { Project } from '../types';

const DB_NAME = 'InnoDrawDB';
const DB_VERSION = 1;
const STORE_NAME = 'projects';

// Helper function to open and set up the database.
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // This event is only triggered when the DB version changes or the DB is first created.
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onerror = () => {
      console.error("IndexedDB error:", request.error);
      reject(new Error("Failed to open database."));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
};

export const getProjects = async (): Promise<Project[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => {
      console.error("Error fetching projects:", request.error);
      reject(new Error("Could not fetch projects from the database."));
    };

    request.onsuccess = () => {
      const projects: Project[] = request.result;
      // Sort by most recent first
      resolve(projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    };
  });
};

export const saveProject = async (project: Project): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    // .put() will add the item or update it if the key already exists.
    const request = store.put(project);

    request.onerror = () => {
      console.error("Error saving project:", request.error);
      reject(new Error("Could not save the project to the database."));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
};

export const deleteProject = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onerror = () => {
      console.error("Error deleting project:", request.error);
      reject(new Error("Could not delete the project from the database."));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
};
// track the searches made by a user

import { Movie, TrendingMovie } from "@/interfaces/interfaces";
import Constants from "expo-constants";
import { Client, Databases, ID, Query } from "react-native-appwrite";


const extra = (Constants?.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

const APPWRITE_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ?? extra.EXPO_PUBLIC_APPWRITE_ENDPOINT ?? extra.APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.EXPO_PUBLIC_PROJECT_ID ?? extra.EXPO_PUBLIC_PROJECT_ID ?? extra.APPWRITE_PROJECT_ID;

export const DATABASE_ID = (process.env.EXPO_PUBLIC_DATABASE_ID ?? extra.EXPO_PUBLIC_DATABASE_ID ?? extra.APPWRITE_DATABASE_ID)!;
export const COLLECTION_ID = (process.env.EXPO_PUBLIC_COLLECTION_ID ?? extra.EXPO_PUBLIC_COLLECTION_ID ?? extra.APPWRITE_COLLECTION_ID)!;

export const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT!)
    .setProject(APPWRITE_PROJECT_ID!);
    
const database= new Databases(client);


export const updateSearchCount = async (query: string, movies: Movie) => {
    try{
        console.log('Debug env:', {
            DATABASE_ID,
            COLLECTION_ID,
            ENDPOINT: APPWRITE_ENDPOINT,
            PROJECT_ID: APPWRITE_PROJECT_ID
        });
        
        if (!DATABASE_ID || !COLLECTION_ID) {
            console.warn("Appwrite env missing: check EXPO_PUBLIC_DATABASE_ID and EXPO_PUBLIC_COLLECTION_ID");
            return;
        }
        if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) {
            console.warn("Appwrite env missing: check EXPO_PUBLIC_APPWRITE_ENDPOINT and EXPO_PUBLIC_PROJECT_ID");
            return;
        }

        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchTerm', query)
        
        ]);



        if(result.documents.length > 0) {
            const existingDocument = result.documents[0];


            await database.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                existingDocument.$id,   
                {
                    count: existingDocument.count + 1 
                }
            )
        } else {
            await  database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(),
            {     
                searchTerm: query,
                movie_id: movies.id,
                count: 1,
                title: movies.title,
                poster_url: `https://image.tmdb.org/t/p/w500${movies.poster_path}`               
            })   
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
    
    // check id a record of that serach has already been stored
    // if a document is found increment the searcCount field
    // if no document is found c
    // create a new document in Appwrite database -> 1

}

export const getTrendingMovies = async (): Promise<TrendingMovie[] | undefined> => {

    try{
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc('count')
        
        ]);

        return result.documents as  unknown as TrendingMovie[];
    } catch (error) {
        console.log(error);
       return undefined;
    }

}
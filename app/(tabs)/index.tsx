import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import TrendingCard from "@/components/TrendingCard";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import type { TrendingMovie } from "@/interfaces/interfaces";
import { fetchMovies } from "@/services/api";
import { getTrendingMovies } from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { ActivityIndicator, FlatList, Image, ScrollView, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();

  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingError
  } = useFetch(getTrendingMovies);  

  const uniqueTrending: TrendingMovie[] = useMemo(() => {
    if (!Array.isArray(trendingMovies)) return [] as TrendingMovie[];
    const idToDoc = new Map<number, TrendingMovie>();
    for (const doc of trendingMovies) {
      const existing = idToDoc.get(doc.movie_id);
      if (!existing || (doc.count ?? 0) > (existing.count ?? 0)) {
        idToDoc.set(doc.movie_id, doc);
      }
    }
    return Array.from(idToDoc.values());
  }, [trendingMovies]);

  const {
    data: movies, 
    loading: moviesLoading, 
    error: moviesError 
  } = useFetch(() => fetchMovies({ 
    query: ''
  }));

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full h-full z-0"/>
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: '100%', paddingBottom: 10 }}
      >
        <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />

        <SearchBar  
          placeholder="Search for movie"
          value=""
          onChangeText={() => {}}
          onPress={() => router.push("/search")}
        />

        {moviesLoading || trendingLoading ? (
          <ActivityIndicator 
            size="large" color="#0000ff"
            className="mt-10 self-center"
          />
        ) : moviesError || trendingError ? (
          <View>
            <Text className="text-white">Error: {moviesError?.message || trendingError?.message}</Text>
          </View>
        ) : (
          <View className="flex-1 mt-5">
            {Array.isArray(trendingMovies) && trendingMovies.length > 0 && (
              <>
                <Text className="text-lg text-white font-bold mb-3 mt-10">Trending Movies</Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ItemSeparatorComponent={() => <View className="w-4" /> }
                  className="mb-4 mt-3"
                  data={uniqueTrending}
                  renderItem={({ item, index }) => (
                    <TrendingCard movie={item} index={index} />
                  )}
                  keyExtractor={(item, idx) => `${item.movie_id?.toString?.() ?? 'unknown'}-${idx}`}
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                />
              </>
            )}

            <Text className="text-lg text-white font-bold mt-5 mb-3">Latest Movies</Text>
            {(Array.isArray(movies) && movies.length > 0) ? (
              <FlatList 
                data={movies}
                renderItem={({ item }) => (
                  <MovieCard
                    {...item}
                  />
                )}
                keyExtractor={(item, idx) => `${item.id?.toString?.() ?? 'unknown'}-${idx}`}
                numColumns={3}
                columnWrapperStyle={{
                  justifyContent: 'flex-start',
                  gap: 20,
                  paddingRight: 5,
                  marginBottom: 10
                }}
                className="mt-2 pb-32"
                scrollEnabled={false}
              />
            ) : (
              <Text className="text-white text-center mt-5">Tidak ada data film.</Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

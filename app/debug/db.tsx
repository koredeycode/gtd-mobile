import { ScreenWrapper } from '@/components/ScreenWrapper';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import React, { useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const DebugDBScreen = () => {
  const [data, setData] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState('habits');
  const [tables] = useState(['categories', 'habits', 'logs']);

  const fetchData = useCallback(async () => {
    try {
      // Use raw SQLite connection for debug monitor since we need dynamic table queries
      // and generic getAllAsync which Drizzle doesn't expose directly on the generic instance.
      const db = SQLite.openDatabaseSync('gtd.db');
      const result = db.getAllSync(`SELECT * FROM ${selectedTable} LIMIT 50`);
      setData(result);
    } catch (error) {
      console.error('Failed to fetch debug data:', error);
    }
  }, [selectedTable]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  return (
    <ScreenWrapper bg="bg-black">
      <View className="flex-row items-center justify-between px-6 pt-2 pb-6 border-b border-[#333]">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
           <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold font-mono">DB Monitor</Text>
        <View className="w-10" />
      </View>

      <View className="px-6 py-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {tables.map(table => (
            <TouchableOpacity
              key={table}
              onPress={() => setSelectedTable(table)}
              className={`px-4 py-2 border mr-3 ${selectedTable === table ? 'bg-[#39FF14] border-[#39FF14]' : 'border-[#333]'}`}
            >
              <Text className={`font-mono text-sm ${selectedTable === table ? 'text-black font-bold' : 'text-[#888]'}`}>
                {table.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView className="mb-20">
          {data.length === 0 ? (
             <Text className="text-[#666] font-mono text-center mt-10">No data found in {selectedTable}</Text>
          ) : (
            data.map((item, index) => (
              <View key={index} className="border border-[#222] p-4 mb-3 bg-[#111]">
                {Object.entries(item).map(([key, value]) => (
                  <View key={key} className="flex-row mb-1">
                    <Text className="text-[#666] font-mono text-xs w-24">{key}:</Text>
                    <Text className="text-[#E0E0E0] font-mono text-xs flex-1">{String(value)}</Text>
                  </View>
                ))}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default DebugDBScreen;

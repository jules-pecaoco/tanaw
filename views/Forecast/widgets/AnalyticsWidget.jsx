import { View, Text, ScrollView, Button } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { MMKV } from "react-native-mmkv";
import React from "react";

const TemperatureTrends = ({ data }) => {
  return (
    <>
      <View>
        <Text>TemperatureTrends</Text>
      </View>
    </>
  );
};

const HeatIndexHistoru = ({ data }) => {
  return (
    <>
      <View>
        <Text>HeatIndexHistoru</Text>
      </View>
    </>
  );
};

const FloodLevelHistory = ({ data }) => {
  return (
    <>
      <View>
        <Text>FloodLevelHistory</Text>
      </View>
    </>
  );
};

const AlertAndNotifcationHistory = ({ data }) => {
  return (
    <>
      <View>
        <Text>AlertAndNotifcationHistory</Text>
      </View>
    </>
  );
};

const DebugPersistenceScreen = () => {
  const queryClient = useQueryClient();

  const logStoredData = () => {
    // Log all cached queries
    const queries = queryClient.getQueryCache().getAll();
    console.log(
      "Cached Queries:",
      queries.map((q) => ({
        key: q.queryKey,
        data: q.state.data,
      }))
    );


    // Log MMKV storage
    const storage = new MMKV();
    console.log("MMKV Keys:", storage.getAllKeys());
    storage.getAllKeys().forEach((key) => {
      console.log(`Key: ${key}, Value:`, storage.getString(key));
    });
  };

  return <Button title="Log Stored Data" onPress={logStoredData} />;
};

const AnalyticsWidget = ({ data }) => {
  return (
    <>
      <ScrollView>
        <TemperatureTrends data={data} />
        <HeatIndexHistoru data={data} />
        <FloodLevelHistory data={data} />
        <AlertAndNotifcationHistory data={data} />
        <DebugPersistenceScreen />
      </ScrollView>
    </>
  );
};

export default AnalyticsWidget;

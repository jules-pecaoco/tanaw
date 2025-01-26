import { View, Text, ScrollView } from "react-native";
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

const AnalyticsWidget = ({ data }) => {
  return (
    <>
      <ScrollView>
        <TemperatureTrends data={data} />
        <HeatIndexHistoru data={data} />
        <FloodLevelHistory data={data} />
        <AlertAndNotifcationHistory data={data} />
      </ScrollView>
    </>
  );
};

export default AnalyticsWidget ;

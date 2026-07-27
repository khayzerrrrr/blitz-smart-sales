import React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"

import DashboardScreen from "./screens/DashboardScreen"
import StockScreen from "./screens/StockScreen"
import KanbanScreen from "./screens/KanbanScreen"

const Tab = createBottomTabNavigator()

export default function App() {
  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: "#f97316",
          background: "#020617",
          card: "#0f172a",
          text: "#f8fafc",
          border: "#1e293b",
          notification: "#f97316",
        },
      }}
    >
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
              Dashboard: "home",
              Stock: "server",
              Kunjungan: "calendar",
              Kanban: "layers",
              Akun: "person",
            }
            return <Ionicons name={icons[route.name] ?? "apps"} size={size} color={color} />
          },
          tabBarActiveTintColor: "#f97316",
          tabBarInactiveTintColor: "#64748b",
          tabBarStyle: { backgroundColor: "#0f172a", borderTopColor: "#1e293b" },
          headerStyle: { backgroundColor: "#020617" },
          headerTintColor: "#f8fafc",
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Stock" component={StockScreen} />
        <Tab.Screen name="Kanban" component={KanbanScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

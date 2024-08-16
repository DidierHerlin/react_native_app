import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import AddArticleScreen from './screens/AddArticleScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Liste d'appartement en vente" component={HomeScreen} />
        <Stack.Screen name="AddArticle" component={AddArticleScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

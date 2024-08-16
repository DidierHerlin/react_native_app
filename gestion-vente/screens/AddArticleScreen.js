import React, { useReducer } from 'react';
import { View, Button, TextInput, Image, StyleSheet, FlatList, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

// Définir les actions pour le reducer
const ACTIONS = {
  UPDATE_FIELD: 'UPDATE_FIELD',
  ADD_PHOTOS: 'ADD_PHOTOS',
  RESET_FORM: 'RESET_FORM',
};

// Définir l'état initial du formulaire
const initialState = {
  idApp: '',
  photos: [],
  surface: '',
  ville: '',
  prix: '',
  description: '',
  status: '',
};

// Définir le reducer pour gérer les actions
const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.UPDATE_FIELD:
      return { ...state, [action.field]: action.value };
    case ACTIONS.ADD_PHOTOS:
      return { ...state, photos: [...state.photos, ...action.photos] };
    case ACTIONS.RESET_FORM:
      return initialState;
    default:
      return state;
  }
};

const AddArticleScreen = ({ navigation }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const selectPhotos = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets) {
      const newPhotos = result.assets.filter(asset => !state.photos.some(photo => photo.uri === asset.uri));
      dispatch({ type: ACTIONS.ADD_PHOTOS, photos: newPhotos });
    }
  };

  const handleAddArticle = async () => {
    const { idApp, surface, ville, prix, description, status, photos } = state;

    if (!idApp || !surface || !ville || !prix || !description || !status || photos.length === 0) {
      Alert.alert('Erreur', 'Tous les champs doivent être remplis et au moins une photo doit être sélectionnée');
      return;
    }

    const photoUrls = photos.map(photo => photo.uri).join(',');

    try {
      const response = await axios.post('http://172.0.0.1:3000/articles', {
        idApp,
        surface,
        ville,
        prix,
        description,
        status,
        photo_urls: photoUrls,
      });

      if (response.status === 201) {
        Alert.alert('Succès', 'Article ajouté avec succès');
        dispatch({ type: ACTIONS.RESET_FORM });
        navigation.goBack();
      } else {
        Alert.alert('Erreur', 'Erreur lors de l\'ajout de l\'article');
      }
    } catch (error) {
      Alert.alert('Erreur de réseau', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Choisir des photos" onPress={selectPhotos} />
      <FlatList
        data={state.photos}
        keyExtractor={(item) => item.uri}
        renderItem={({ item }) => (
          <Image source={{ uri: item.uri }} style={styles.image} />
        )}
        horizontal
      />
      <TextInput
        style={styles.input}
        placeholder="ID de l'application"
        value={state.idApp}
        onChangeText={(text) => dispatch({ type: ACTIONS.UPDATE_FIELD, field: 'idApp', value: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Surface (m²)"
        value={state.surface}
        onChangeText={(text) => dispatch({ type: ACTIONS.UPDATE_FIELD, field: 'surface', value: text })}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Ville"
        value={state.ville}
        onChangeText={(text) => dispatch({ type: ACTIONS.UPDATE_FIELD, field: 'ville', value: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Prix"
        value={state.prix}
        onChangeText={(text) => dispatch({ type: ACTIONS.UPDATE_FIELD, field: 'prix', value: text })}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={state.description}
        onChangeText={(text) => dispatch({ type: ACTIONS.UPDATE_FIELD, field: 'description', value: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Status"
        value={state.status}
        onChangeText={(text) => dispatch({ type: ACTIONS.UPDATE_FIELD, field: 'status', value: text })}
      />
      <Button title="Ajouter" onPress={handleAddArticle} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
});

export default AddArticleScreen;

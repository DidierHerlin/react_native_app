import React, { useState, useCallback } from 'react';
import { View, FlatList, Image, Text, StyleSheet, ActivityIndicator, Modal, TextInput, Alert, TouchableOpacity, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// Hook personnalisé pour les appels API
const useApi = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Erreur lors de la récupération des données');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  return { data, loading, error, refetch: fetchData };
};

const HomeScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [updatedArticle, setUpdatedArticle] = useState({
    description: '',
    ville: '',
    surface: '',
    prix: '',
    photo_urls: '',
  });
  const [image, setImage] = useState(null);
  const [searchText, setSearchText] = useState('');

  // Utilisation du hook personnalisé pour les articles
  const { data: articles, loading, error, refetch } = useApi('http://127.0.0.1:3000/articles');

  const filteredArticles = articles.filter((article) => {
    const searchLower = searchText.toLowerCase();
    return (
      article.description.toLowerCase().includes(searchLower) ||
      article.ville.toLowerCase().includes(searchLower) ||
      article.status.toLowerCase().includes(searchLower)
    );
  });

  const handleUpdateArticle = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:3000/articles/${selectedArticle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedArticle),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour de l\'article');
      refetch(); // Recharger les articles après mise à jour
      setModalVisible(false);
      Alert.alert('Succès', 'Article mis à jour avec succès');
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleDeleteArticle = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:3000/articles/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erreur lors de la suppression de l\'article');
      refetch(); // Recharger les articles après suppression
      Alert.alert('Succès', 'Article supprimé avec succès');
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  const confirmDeleteArticle = (id) => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer cet article ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          onPress: () => handleDeleteArticle(id),
          style: 'destructive',
        },
      ]
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setUpdatedArticle((prev) => ({ ...prev, photo_urls: result.assets[0].uri }));
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Image source={{ uri: item.photo_urls.split(',')[0] }} style={styles.image} />
      <Text style={styles.title}>{item.description}</Text>
      <Text>{item.ville}</Text>
      <Text>{item.surface} m²</Text>
      <Text>{item.prix} Ar</Text>
      <Text>Statut: {item.status}</Text>
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => {
          setSelectedArticle(item);
          setUpdatedArticle({
            description: item.description,
            ville: item.ville,
            surface: item.surface,
            prix: item.prix,
            photo_urls: item.photo_urls,
          });
          setModalVisible(true);
        }}>
          <FontAwesome name="pencil" size={24} color="blue" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => confirmDeleteArticle(item.id)}>
          <FontAwesome name="trash" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher description, ville ou statut..."
        value={searchText}
        onChangeText={setSearchText}
      />
      <FlatList
        data={filteredArticles}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
      <Button title="Ajouter un article" onPress={() => navigation.navigate('AddArticle')} />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalView}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <FontAwesome name="times" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Modifier l'article</Text>
            <Button title="Choisir une image" onPress={pickImage} />
            {image && <Image source={{ uri: image }} style={styles.selectedImage} />}
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={updatedArticle.description}
              onChangeText={(text) => setUpdatedArticle((prev) => ({ ...prev, description: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Ville"
              value={updatedArticle.ville}
              onChangeText={(text) => setUpdatedArticle((prev) => ({ ...prev, ville: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Surface"
              value={updatedArticle.surface}
              onChangeText={(text) => setUpdatedArticle((prev) => ({ ...prev, surface: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Prix"
              value={updatedArticle.prix}
              onChangeText={(text) => setUpdatedArticle((prev) => ({ ...prev, prix: text }))}
            />
            
            <Button title="Mettre à jour" onPress={handleUpdateArticle} />
            <Button title="Annuler" onPress={() => setModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  list: {
    paddingBottom: 20,
  },
  item: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%',
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  selectedImage: {
    width: '100%',
    height: 150,
    marginVertical: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default HomeScreen;

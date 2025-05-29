import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, Alert, ScrollView, Modal,
  TextInput, TouchableOpacity, ActivityIndicator, Keyboard,
} from 'react-native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import SvgUri from 'expo-svg-uri';

export default function App() {
  const [weather, setWeather] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputCity, setInputCity] = useState('');
  const [loading, setLoading] = useState(true);

  async function fetchWeatherByCity(city) {
    try {
      setLoading(true);
      setErrorMsg(null);
      const response = await fetch(
        `https://api.hgbrasil.com/weather?key=eeee6847&city_name=${encodeURIComponent(city)}`
      );
      const data = await response.json();
      if (data && data.results && !data.error) {
        setWeather(data.results);
        setModalVisible(false);
        setInputCity('');
      } else {
        setErrorMsg('Cidade não encontrada');
      }
    } catch {
      setErrorMsg('Erro ao buscar clima');
    } finally {
      setLoading(false);
    }
  }

  async function fetchWeatherByLocation() {
    try {
      setLoading(true);
      setErrorMsg(null);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permissão de localização negada');
        Alert.alert('Permissão negada', 'É necessário permitir a localização.');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const response = await fetch(
        `https://api.hgbrasil.com/weather?key=8d5f2c8d&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      if (data && data.results && !data.error) {
        setWeather(data.results);
      } else {
        setErrorMsg('Erro ao carregar clima');
      }
    } catch {
      setErrorMsg('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWeatherByLocation();
  }, []);

  return (
    <LinearGradient colors={['#0d1f6b', '#1f3e9f']} style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.cidadeTopo} onPress={() => setModalVisible(true)}>
            <MaterialIcons name="location-on" size={24} color="white" />
            <Text style={[styles.text, { marginLeft: 5 }]}>
              {weather ? weather.city : 'Carregando...'}
            </Text>
            <MaterialIcons name="edit" size={20} color="white" style={{ marginLeft: 5 }} />
          </TouchableOpacity>

          {weather ? (
            <>
              <View style={styles.temperatura_hoje}>
                {weather.condition_slug && (
                  <SvgUri
                    width="100"
                    height="100"
                    source={{
                      uri: `https://assets.hgbrasil.com/weather/icons/conditions/${weather.condition_slug}.svg`,
                    }}
                  />
                )}
                <Text style={styles.text}>{weather.description}</Text>
                <Text style={styles.temperaturaAtual}>{weather.temp}°C</Text>
                {weather.forecast && weather.forecast[0] && (
                  <Text style={[styles.text, { fontSize: 20, marginTop: 5 }]}>
                    Máx: {weather.forecast[0].max}°C / Mín: {weather.forecast[0].min}°C
                  </Text>
                )}
                <View style={styles.ventosContainer}>
                  <Text style={styles.ventosText}>Umidade: {weather.humidity}%</Text>
                  <Text style={styles.ventosText}>Vento: {weather.wind_speedy}</Text>
                  <Text style={styles.ventosText}>🌧️ Chuva: {weather.rain} mm</Text>
                </View>
              </View>

              <View style={styles.hoje}>
                <View style={styles.hojeTituloContainer}>
                  <Text style={styles.text}>Hoje:</Text>
                </View>
                <View style={styles.sunRow}>
                  <View style={styles.sunBox}>
                    <MaterialIcons name="wb-sunny" size={40} color="#FFD700" />
                    <Text style={styles.sunLabel}>Nascer do sol</Text>
                    <Text style={styles.sunHour}>{weather.sunrise}</Text>
                  </View>
                  <View style={styles.sunBox}>
                    <MaterialIcons name="nights-stay" size={40} color="#87CEEB" />
                    <Text style={styles.sunLabel}>Pôr do sol</Text>
                    <Text style={styles.sunHour}>{weather.sunset}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.previsaoContainer}>
                <View style={styles.previsaoTituloContainer}>
                  <Text style={styles.text}>Próximos dias:</Text>
                </View>
                {weather.forecast &&
                  weather.forecast.slice(1, 7).map((dia, index) => (
                    <View key={index} style={styles.previsaoDia}>
                      <Text style={styles.diaTexto}>
                        {dia.weekday} {dia.date}
                      </Text>
                      <View style={styles.svgWrapper}>
                        <SvgUri
                          width={90}
                          height={90}
                          source={{
                            uri: `https://assets.hgbrasil.com/weather/icons/conditions/${dia.condition}.svg`,
                          }}
                        />
                      </View>
                      <Text style={styles.tempMaxMin}>
                        {dia.max}° / {dia.min}°
                      </Text>
                    </View>
                  ))}
              </View>
            </>
          ) : (
            <Text style={styles.text}>{errorMsg || 'Carregando previsão do tempo...'}</Text>
          )}
          <StatusBar style="light" />
        </ScrollView>
      )}

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Digite o nome da cidade:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: São Paulo"
              placeholderTextColor="#aaa"
              value={inputCity}
              onChangeText={setInputCity}
              autoFocus
              onSubmitEditing={() => {
                Keyboard.dismiss();
                if (inputCity.trim() !== '') {
                  fetchWeatherByCity(inputCity.trim());
                }
              }}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#0d1f6b' }]}
                onPress={() => {
                  if (inputCity.trim() !== '') {
                    fetchWeatherByCity(inputCity.trim());
                  } else {
                    Alert.alert('Erro', 'Digite o nome da cidade.');
                  }
                }}
              >
                <Text style={styles.modalButtonText}>Buscar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#999' }]}
                onPress={() => {
                  setModalVisible(false);
                  setInputCity('');
                }}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#3b5998', marginTop: 15 }]}
              onPress={() => {
                Keyboard.dismiss();
                fetchWeatherByLocation();
                setModalVisible(false);
              }}
            >
              <MaterialIcons name="my-location" size={24} color="white" />
              <Text style={[styles.modalButtonText, { marginLeft: 10 }]}>Usar localização local</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  scrollContainer: { paddingVertical: 60, alignItems: 'center', paddingBottom: 100 },
  temperatura_hoje: { alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontSize: 25 },
  temperaturaAtual: { fontSize: 65, color: '#fff', fontWeight: 'bold' },
  ventosContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  ventosText: { color: '#ddd', fontSize: 19, marginHorizontal: 5 },
  cidadeTopo: {
    position: 'absolute',
    top: 40,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  hoje: {
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: 15,
    width: '100%',
  },
  hojeTituloContainer: { alignSelf: 'flex-start', marginBottom: 10 },
  sunRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  sunBox: {
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: '45%',
  },
  sunLabel: { color: '#fff', fontSize: 16, marginTop: 8 },
  sunHour: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 4 },
  previsaoContainer: {
    marginTop: 30,
    width: '100%',
    backgroundColor: 'rgba(0,0,0, 0.3)',
    borderRadius: 10,
    padding: 15,
  },
  previsaoTituloContainer: { alignSelf: 'flex-start', marginBottom: 10, marginLeft: 5 },
  previsaoDia: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    marginBottom: 10,
    minHeight: 90,
  },
  diaTexto: { color: '#fff', fontWeight: 'bold', width: '30%' },
  tempMaxMin: { color: '#fff', fontSize: 16, textAlign: 'right', width: '30%' },
  svgWrapper: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalContainer: {
    backgroundColor: '#1f3e9f',
    borderRadius: 10,
    padding: 20,
    width: '100%',
  },
  modalTitle: { color: '#fff', fontSize: 20, marginBottom: 15, textAlign: 'center' },
  input: {
    backgroundColor: '#0d1f6b',
    borderRadius: 5,
    color: '#fff',
    fontSize: 18,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 20,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-around' },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
});
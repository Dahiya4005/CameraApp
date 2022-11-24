import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Constants from 'expo-constants';
import { Camera, CameraType } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { MaterialIcons } from '@expo/vector-icons';
import Button from './src/components/Button';
import Timer from './src/components/Timer';
import Slider from '@react-native-community/slider';

export default function App() {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [image, setImage] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
  const [timerClicked, setTimerClicked] = useState(false);
  const [timerOn, setTimerOn] = useState(false);
  const [timer, setTimer] = useState(0);
  const [displayTimer, setDisplayTimer] = useState(timer);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!timerOn) {
      return;
    }
    setDisplayTimer(timer);

    const interval = setInterval(() => {
      setDisplayTimer(prevTimer =>
        prevTimer > 0 ? prevTimer - 1 : clearInterval(interval)
      );
    }, 1000);

    (async () => {
      MediaLibrary.requestPermissionsAsync();
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');
    })();
  }, [timerOn, setTimerOn, timer]);

  const onPressTimerItem = time => {
    setTimerClicked(prevState => !prevState);
    setTimer(time);
  };

  const takePicture = async () => {
    setTimerOn(true);
    setTimeout(async function () {
      if (cameraRef) {
        try {
          const data = await cameraRef.current.takePictureAsync();
          setImage(data.uri);
          setTimerOn(false);
        } catch (error) {
          console.log(error);
        }
      }
    }, timer * 1000);
  };

  const savePicture = async () => {
    if (image) {
      try {
        const asset = await MediaLibrary.createAssetAsync(image);
        alert('Picture saved! 🎉');
        setImage(null);
        console.log('saved successfully');
      } catch (error) {
        console.log(error);
      }
    }
  };

  if (hasCameraPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {timerClicked && <Timer onPress={onPressTimerItem} />}
      {!image ? (
        <Camera
          style={styles.camera}
          type={type}
          ref={cameraRef}
          flashMode={flash}
        >
          <View style={styles.timerContainer}>
            <View style={styles.buttonContainer}>
              <Button
                icon={'retweet'}
                title="Flip"
                onPress={() =>
                  setType(
                    type === Camera.Constants.Type.back
                      ? Camera.Constants.Type.front
                      : Camera.Constants.Type.back
                  )
                }
                color="#f1f1f1"
              />
              <Button
                icon={'back-in-time'}
                title="Timer"
                onPress={() => setTimerClicked(prevState => !prevState)}
              />
              <Text style={styles.timerText}>{timer}s</Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 30,
            }}
          >
            <Button
              title=""
              icon="retweet"
              onPress={() => {
                setType(
                  type === CameraType.back ? CameraType.front : CameraType.back
                );
              }}
            />
            <Button
              onPress={() =>
                setFlash(
                  flash === Camera.Constants.FlashMode.off
                    ? Camera.Constants.FlashMode.on
                    : Camera.Constants.FlashMode.off
                )
              }
              icon="flash"
              color={flash === Camera.Constants.FlashMode.off ? 'gray' : '#fff'}
            />
          </View>
        </Camera>
      ) : (
        <Image source={{ uri: image }} style={styles.camera} />
      )}

      <View style={styles.controls}>
        {image ? (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 50,
            }}
          >
            <Button
              title="Re-take"
              onPress={() => setImage(null)}
              icon="retweet"
            />
            <Button title="Save" onPress={savePicture} icon="check" />
          </View>
        ) : (
          <Button title="" onPress={takePicture} icon="camera" />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#000',
    padding: 8,
  },
  controls: {
    flex: 0.5,
  },
  button: {
    height: 40,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#E9730F',
    marginLeft: 10,
  },
  camera: {
    flex: 5,
    borderRadius: 20,
  },
  topControls: {
    flex: 1,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    color: '#f1f1f1',
    fontSize: 16,
    marginLeft: 10,
  },
  displayTimerText: {
    color: '#f1f1f1',
    fontSize: 50,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

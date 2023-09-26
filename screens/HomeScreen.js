import {
  View,
  Text,
  StatusBar,
  Image,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Appearance,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {theme} from '../theme';
import {MagnifyingGlassIcon} from 'react-native-heroicons/outline';
import {MapPinIcon, CalendarDaysIcon} from 'react-native-heroicons/solid';
import {debounce} from 'lodash';
import {fetchLocations, fetchWeatherForecast} from '../api/weather';
import {weatherImages} from '../constants';
import * as Progress from 'react-native-progress';
import {getData, storeData} from '../utils/asyncStorage';

const HomeScreen = () => {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setlocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);
  const [themebg, setThemeBg] = useState('');

  //* Theme

  useEffect(() => {
    const listener = Appearance.addChangeListener(colorTheme => {
      if (colorTheme.colorScheme === 'dark') {
        setThemeBg('dark');
      } else {
        setThemeBg('light');
      }
    });
    return () => {
      listener;
    };
  }, []);

  const handleLocation = loc => {
    // console.log('Location', loc);
    setlocations([]);
    toggleSearch(false);
    setLoading(true);
    fetchWeatherForecast({
      cityName: loc.name,
      days: '7',
    }).then(data => {
      setWeather(data);
      setLoading(false);
      storeData('city', loc.name);
      // console.log('got forecast ', data);
    });
  };

  const handleSearch = value => {
    //* fetch locations
    if (value.length > 2) {
      fetchLocations({cityName: value}).then(data => {
        setlocations(data);
      });
    }
  };

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    let myCity = await getData('city');
    let cityName = 'Islamabad';
    if (myCity) cityName = myCity;
    fetchWeatherForecast({
      cityName,
      days: '7',
    }).then(data => {
      setWeather(data);
      setLoading(false);
    });
  };
  const handleTextBounce = useCallback(debounce(handleSearch, 1200), []);

  const {current, location} = weather;

  return (
    <View style={{flex: 1, position: 'relative'}}>
      <StatusBar
        barStyle={'light-content'}
        translucent
        backgroundColor="transparent"
      />
      <Image
        source={require('../assets/images/bg.png')}
        blurRadius={70}
        style={{position: 'absolute', height: '100%', width: '100%'}}
      />
      <View
        style={{
          flex: 1,
          backgroundColor:
            themebg === 'light' ? 'transparent' : 'rgba(0,0,0,0.6)',
        }}>
        {loading ? (
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Progress.CircleSnail
              thickness={10}
              size={140}
              color={'#0bb3b2'}
              fill="transparent"
            />
          </View>
        ) : (
          <SafeAreaView style={{flex: 1}}>
            {/* Search Section */}
            <View
              style={{
                top: '5.5%',
                marginHorizontal: 10,
                position: 'relative',
                zIndex: 50,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  borderRadius: 100,
                  backgroundColor: showSearch
                    ? themebg === 'light'
                      ? 'rgba(0,0,0,0.5)'
                      : theme.bgWhite(0.2)
                    : 'transparent',
                }}>
                {showSearch ? (
                  <TextInput
                    onChangeText={handleTextBounce}
                    placeholder="Search city"
                    placeholderTextColor={
                      themebg === 'light' ? 'white' : 'lightgray'
                    }
                    style={{
                      paddingLeft: 20,
                      paddingRight: 20,
                      height: 50,
                      flex: 1,
                      color: themebg === 'white' ? 'black' : 'white',
                    }}
                  />
                ) : null}

                <TouchableOpacity
                  onPress={() => toggleSearch(!showSearch)}
                  style={{
                    backgroundColor:
                      themebg == 'light'
                        ? theme.bgWhite(0.8)
                        : theme.bgWhite(0.3),
                    borderRadius: 100,
                    padding: 7,
                    marginRight: 8,
                  }}>
                  <MagnifyingGlassIcon
                    size={25}
                    color={themebg === 'light' ? 'black' : 'white'}
                  />
                </TouchableOpacity>
              </View>
              {locations.length > 0 && showSearch ? (
                <View
                  style={{
                    position: 'absolute',
                    width: '100%',
                    backgroundColor:
                      themebg === 'light' ? 'rgba(0,0,0,0.5)' : '#d1d5db',
                    top: 60,
                    borderRadius: 24,
                  }}>
                  {locations.map((loc, index) => {
                    let showBorder = index + 1 != locations.length;
                    return (
                      <TouchableOpacity
                        onPress={() => handleLocation(loc)}
                        key={index}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 3,
                          paddingHorizontal: 14,
                          marginBottom: 10,
                          marginTop: showBorder ? 10 : 0,
                          borderBottomWidth: showBorder ? 1 : 0,
                          borderBlockColor: showBorder
                            ? 'rgb(156 163 175)'
                            : '',
                        }}>
                        <MapPinIcon
                          size={20}
                          color={themebg == 'light' ? 'white' : 'gray'}
                        />
                        <Text
                          style={{
                            color: themebg == 'light' ? 'white' : 'black',
                            fontSize: 16,
                            marginLeft: 6,
                          }}>
                          {loc?.name}, {loc?.country}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}
            </View>
            {/* Focast Section */}
            <View
              style={{
                marginHorizontal: 4,
                flex: 1,
                justifyContent: 'space-evenly',
                marginBottom: 8,
              }}>
              {/* Location */}
              <Text
                style={{
                  color: themebg == 'light' ? 'black' : 'white',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: 24,
                }}>
                {location?.name},
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: themebg == 'light' ? 'rgba(0,0,0,0.6)' : '#d1d5db',
                  }}>
                  {` ${location?.country}`}
                </Text>
              </Text>
              {/* Weather Image */}
              <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                <Image
                  source={weatherImages[current?.condition?.text]}
                  // source={require('../assets/images/partlycloudy.png')}
                  style={{height: 208, width: 208}}
                />
              </View>
              {/* Degree Celsius */}
              <View style={{marginTop: 5}}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: themebg == 'light' ? 'black' : 'white',
                    fontSize: 60,
                    marginLeft: 5,
                  }}>
                  {current?.temp_c}&#176;
                </Text>
                <Text
                  style={{
                    textAlign: 'center',
                    color: themebg == 'light' ? 'rgba(0,0,0,0.5)' : 'white',
                    fontSize: 20,
                    marginLeft: 5,
                  }}>
                  {current?.condition?.text}
                </Text>
              </View>
              {/* Other Status */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  marginHorizontal: 4,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    marginLeft: 16,
                    alignItems: 'center',
                  }}>
                  <Image
                    source={require('../assets/icons/wind.png')}
                    style={{
                      height: 24,
                      width: 24,
                      tintColor: themebg == 'light' ? 'black' : 'white',
                    }}
                  />
                  <Text
                    style={{
                      color: themebg == 'light' ? 'black' : 'white',
                      fontWeight: '600',
                      alignItems: 'stretch',
                      marginLeft: 5,
                    }}>
                    {current?.wind_kph}km
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    marginLeft: 16,
                    alignItems: 'center',
                  }}>
                  <Image
                    source={require('../assets/icons/drop.png')}
                    style={{
                      height: 24,
                      width: 24,
                      tintColor: themebg == 'light' ? 'black' : 'white',
                    }}
                  />
                  <Text
                    style={{
                      color: themebg == 'light' ? 'black' : 'white',
                      fontWeight: '600',
                      alignItems: 'stretch',
                      marginLeft: 5,
                    }}>
                    {current?.humidity}%
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    marginLeft: 16,
                    alignItems: 'center',
                  }}>
                  <Image
                    source={require('../assets/icons/sun.png')}
                    style={{
                      height: 24,
                      width: 24,
                      tintColor: themebg == 'light' ? 'black' : 'white',
                    }}
                  />
                  <Text
                    style={{
                      color: themebg == 'light' ? 'black' : 'white',
                      fontWeight: '600',
                      alignItems: 'stretch',
                      marginLeft: 5,
                    }}>
                    {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                  </Text>
                </View>
              </View>
            </View>
            {/* Forecast for next days */}
            <View style={{marginBottom: 16, marginTop: -12}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginLeft: 18,
                  marginTop: 8,
                }}>
                <CalendarDaysIcon
                  size={32}
                  color={themebg == 'light' ? 'black' : 'white'}
                />
                <Text
                  style={{
                    color: themebg == 'light' ? 'black' : 'white',
                    fontSize: 16,
                    marginLeft: 5,
                  }}>
                  Daily Forecast
                </Text>
              </View>
              <ScrollView
                horizontal
                contentContainerStyle={{paddingHorizontal: 15}}
                showsHorizontalScrollIndicator={false}>
                {weather?.forecast?.forecastday?.map((item, index) => {
                  let date = new Date(item.date);
                  let options = {weekday: 'long'};
                  let dayName = date.toLocaleDateString('en-US', options);
                  dayName = dayName.split(',')[0];
                  return (
                    <View
                      key={index}
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 96,
                        borderRadius: 24,
                        paddingBottom: 12,
                        paddingTop: 12,
                        marginTop: 4,
                        marginRight: 16,
                        backgroundColor: theme.bgWhite(0.15),
                      }}>
                      <Image
                        source={weatherImages[item?.day?.condition?.text]}
                        style={{height: 44, width: 44}}
                      />
                      <Text
                        style={{color: themebg == 'light' ? 'black' : 'white'}}>
                        {dayName}
                      </Text>
                      <Text
                        style={{
                          color: themebg == 'light' ? 'black' : 'white',
                          fontSize: 20,
                          fontWeight: '600',
                        }}>
                        {item?.day?.avgtemp_c}&#176;
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </SafeAreaView>
        )}
      </View>
    </View>
  );
};

export default HomeScreen;

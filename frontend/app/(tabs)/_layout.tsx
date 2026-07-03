import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadowFab, shadowSoft } from '@/src/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_META: Record<string, { label: string; icon: IconName; iconActive: IconName }> = {
  index: { label: 'Home', icon: 'home-outline', iconActive: 'home' },
  appointments: { label: 'Appts', icon: 'calendar-outline', iconActive: 'calendar' },
  mydocs: { label: 'MyDocs', icon: 'people-outline', iconActive: 'people' },
  prescription: { label: 'Rx', icon: 'document-text-outline', iconActive: 'document-text' },
  profile: { label: 'Profile', icon: 'person-outline', iconActive: 'person' },
};

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  return (
    <View
      testID="bottom-tab-bar"
      style={[
        styles.bar,
        shadowSoft,
        { paddingBottom: Math.max(insets.bottom, 12) + 8 },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const meta = TAB_META[route.name];
        if (!meta) return null;
        const isFocused = state.index === index;
        const isCenter = route.name === 'mydocs';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (isCenter) {
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.85}
              testID={`tab-${route.name}`}
              style={styles.centerWrap}
            >
              <LinearGradient
                colors={[colors.brandPrimary, colors.brandSecondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.centerBtn, shadowFab]}
              >
                <Ionicons name="people" size={26} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.centerLabel, isFocused && { color: colors.brandPrimary }]}>MyDocs</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.7}
            testID={`tab-${route.name}`}
            style={styles.tab}
          >
            <Ionicons
              name={isFocused ? meta.iconActive : meta.icon}
              size={22}
              color={isFocused ? colors.brandPrimary : colors.muted}
            />
            <Text style={[styles.label, isFocused && styles.labelActive]}>{meta.label}</Text>
            {isFocused ? <View style={styles.activeDot} /> : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="appointments" />
      <Tabs.Screen name="mydocs" />
      <Tabs.Screen name="prescription" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: Platform.OS === 'android' ? 0 : 0.5,
    borderTopColor: colors.divider,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 4,
  },
  label: {
    fontSize: 10,
    color: colors.muted,
    fontWeight: '500',
  },
  labelActive: {
    color: colors.brandPrimary,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.brandPrimary,
    marginTop: 2,
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  centerBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  centerLabel: {
    fontSize: 10,
    color: colors.muted,
    fontWeight: '500',
  },
});

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TeamScreen } from '../screens/team/TeamScreen';
import { AddMemberScreen } from '../screens/team/AddMemberScreen';
import { MemberDetailsScreen } from '../screens/team/MemberDetailsScreen';

export type TeamStackParamList = {
  TeamList: { projectId?: string };
  AddMember: { projectId: string };
  MemberDetails: { projectId: string; memberId: string; userId: string };
};

const Stack = createNativeStackNavigator<TeamStackParamList>();

export const TeamNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen
        name="TeamList"
        component={TeamScreen}
        options={{
          title: 'Team',
        }}
      />
      <Stack.Screen
        name="AddMember"
        component={AddMemberScreen}
        options={{
          title: 'Add Team Member',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="MemberDetails"
        component={MemberDetailsScreen}
        options={{
          title: 'Member Details',
        }}
      />
    </Stack.Navigator>
  );
};
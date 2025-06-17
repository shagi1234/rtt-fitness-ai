import NetInfo from "@react-native-community/netinfo";

export const checkNetworkConnection = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return state.isConnected === true;
};

export const subscribeToNetworkChanges = (
  callback: (isConnected: boolean) => void
): (() => void) => {
  return NetInfo.addEventListener((state) => {
    callback(state.isConnected === true);
  });
};

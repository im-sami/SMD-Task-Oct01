import { useMemo, useState } from 'react';
import {
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Filter = 'all' | 'active' | 'done';

type Task = {
  id: string;
  title: string;
  done: boolean;
};

const initialTasks: Task[] = [
  { id: '1', title: 'Plan the day', done: true },
  { id: '2', title: 'Finish the product brief', done: false },
  { id: '3', title: 'Take a proper lunch break', done: false },
];

const palette = {
  light: {
    background: '#F8F7F3',
    card: '#FFFFFF',
    text: '#1D211B',
    muted: '#7A8177',
    border: '#E5E7DF',
    accent: '#286B52',
    accentSoft: '#E3F0E9',
    input: '#EEF1EA',
  },
  dark: {
    background: '#151A17',
    card: '#202721',
    text: '#F4F7F1',
    muted: '#AAB4AA',
    border: '#344137',
    accent: '#8BD2AC',
    accentSoft: '#264538',
    input: '#29332B',
  },
} as const;

export default function HomeScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = palette[scheme];
  const insets = useSafeAreaInsets();
  const [tasks, setTasks] = useState(initialTasks);
  const [draft, setDraft] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const visibleTasks = useMemo(
    () => tasks.filter((task) => filter === 'all' || (filter === 'done' ? task.done : !task.done)),
    [filter, tasks],
  );
  const completedCount = tasks.filter((task) => task.done).length;
  const activeCount = tasks.length - completedCount;

  const addTask = () => {
    const title = draft.trim();
    if (!title) return;
    setTasks((current) => [{ id: Date.now().toString(), title, done: false }, ...current]);
    setDraft('');
    Keyboard.dismiss();
  };

  const toggleTask = (id: string) => {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    );
  };

  const removeTask = (id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id));
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlatList
        data={visibleTasks}
        keyExtractor={(task) => task.id}
        contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 112 }}
        ListHeaderComponent={
          <View>
            <View style={styles.headerRow}>
              <View>
                <Text style={[styles.eyebrow, { color: colors.accent }]}>MY DAY</Text>
                <Text style={[styles.title, { color: colors.text }]}>A little lighter.</Text>
                <Text style={[styles.subtitle, { color: colors.muted }]}>One thing at a time.</Text>
              </View>
              <View style={[styles.countBadge, { backgroundColor: colors.accentSoft }]}>
                <Text style={[styles.countNumber, { color: colors.accent }]}>{activeCount}</Text>
                <Text style={[styles.countLabel, { color: colors.accent }]}>left</Text>
              </View>
            </View>

            <View style={[styles.addRow, { backgroundColor: colors.input }]}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={addTask}
                placeholder="What needs doing?"
                placeholderTextColor={colors.muted}
                returnKeyType="done"
                style={[styles.input, { color: colors.text }]}
              />
              <Pressable
                accessibilityLabel="Add task"
                accessibilityRole="button"
                onPress={addTask}
                style={({ pressed }) => [
                  styles.addButton,
                  { backgroundColor: colors.accent, opacity: pressed ? 0.75 : 1 },
                ]}>
                <Text style={styles.addButtonText}>+</Text>
              </Pressable>
            </View>

            <View style={[styles.filterBar, { borderBottomColor: colors.border }]}>
              {(['all', 'active', 'done'] as Filter[]).map((option) => (
                <Pressable key={option} onPress={() => setFilter(option)} style={styles.filterButton}>
                  <Text
                    style={[
                      styles.filterText,
                      { color: filter === option ? colors.accent : colors.muted },
                      filter === option && styles.filterTextSelected,
                    ]}>
                    {option === 'all' ? `All ${tasks.length}` : option === 'active' ? `Active ${activeCount}` : `Done ${completedCount}`}
                  </Text>
                  {filter === option && <View style={[styles.activeLine, { backgroundColor: colors.accent }]} />}
                </Pressable>
              ))}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.taskRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Pressable
              accessibilityLabel={item.done ? `Mark ${item.title} active` : `Complete ${item.title}`}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: item.done }}
              onPress={() => toggleTask(item.id)}
              style={[styles.checkbox, { borderColor: item.done ? colors.accent : colors.border, backgroundColor: item.done ? colors.accent : 'transparent' }]}>
              {item.done && <Text style={styles.checkmark}>✓</Text>}
            </Pressable>
            <Text style={[styles.taskTitle, { color: item.done ? colors.muted : colors.text }, item.done && styles.completedTask]}>
              {item.title}
            </Text>
            <Pressable accessibilityLabel={`Delete ${item.title}`} onPress={() => removeTask(item.id)} style={styles.deleteButton}>
              <Text style={[styles.deleteText, { color: colors.muted }]}>×</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Nothing here yet.</Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>Add a task above to get moving.</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerRow: { paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginBottom: 12 },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 16, marginTop: 5 },
  countBadge: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center', marginTop: 7 },
  countNumber: { fontSize: 22, fontWeight: '800', lineHeight: 24 },
  countLabel: { fontSize: 11, fontWeight: '700' },
  addRow: { marginHorizontal: 20, marginTop: 28, borderRadius: 16, padding: 6, paddingLeft: 18, flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, fontSize: 16, paddingVertical: 12 },
  addButton: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: '#FFFFFF', fontSize: 28, fontWeight: '400', lineHeight: 28 },
  filterBar: { marginHorizontal: 20, marginTop: 26, flexDirection: 'row', borderBottomWidth: 1 },
  filterButton: { marginRight: 26, paddingBottom: 13, position: 'relative' },
  filterText: { fontSize: 13, fontWeight: '600' },
  filterTextSelected: { fontWeight: '800' },
  activeLine: { position: 'absolute', height: 2, left: 0, right: 0, bottom: -1, borderRadius: 2 },
  taskRow: { minHeight: 68, marginHorizontal: 20, marginTop: 12, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  checkmark: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', lineHeight: 19 },
  taskTitle: { flex: 1, fontSize: 15, fontWeight: '600' },
  completedTask: { textDecorationLine: 'line-through' },
  deleteButton: { padding: 8, marginLeft: 6 },
  deleteText: { fontSize: 25, fontWeight: '300', lineHeight: 22 },
  emptyState: { alignItems: 'center', paddingTop: 58 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { fontSize: 14, marginTop: 8 },
});

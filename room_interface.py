# room_interface.py
from room_manager import RoomManager, RoomStatus
from algorithms.library import algorithms
from utils.helpers import choose_algorithm, generate_random_array
from utils.room_battle_runner import execute_room_battle
import random


class RoomInterface:
    def __init__(self):
        self.room_manager = RoomManager()
        self.current_player = None
        self.current_room_id = None
    
    def start(self):
        """Main menu for the room system."""
        print("🔥 Welcome to Algorithm Battlefield - Room Edition! 🔥\n")
        
        while True:
            if not self.current_player:
                self._show_main_menu()
            elif not self.current_room_id:
                self._show_player_menu()
            else:
                self._show_room_menu()
    
    def _show_main_menu(self):
        """Show main menu for entering player name."""
        print("\n" + "="*50)
        print("🎮 MAIN MENU")
        print("="*50)
        
        player_name = input("Enter your player name: ").strip()
        if not player_name:
            print("❌ Player name cannot be empty!")
            return
        
        self.current_player = player_name
        print(f"✅ Welcome, {player_name}!")
    
    def _show_player_menu(self):
        """Show menu for players not in a room."""
        print("\n" + "="*50)
        print(f"🎮 PLAYER MENU - {self.current_player}")
        print("="*50)
        print("1. 🏗️  Create a new battlefield room")
        print("2. 🔍 Browse and join available rooms")
        print("3. 🏠 Change player name")
        print("4. 🚪 Exit")
        
        choice = input("\nEnter your choice (1-4): ").strip()
        
        if choice == "1":
            self._create_room_menu()
        elif choice == "2":
            self._browse_rooms_menu()
        elif choice == "3":
            self.current_player = None
        elif choice == "4":
            print("👋 Thanks for playing! Goodbye!")
            exit()
        else:
            print("❌ Invalid choice! Please try again.")
    
    def _create_room_menu(self):
        """Menu for creating a new room."""
        print("\n" + "="*50)
        print("🏗️  CREATE NEW BATTLEFIELD ROOM")
        print("="*50)
        
        room_name = input("Enter room name: ").strip()
        if not room_name:
            print("❌ Room name cannot be empty!")
            return
        
        # Choose purpose/category
        categories = sorted(set(a["category"] for a in algorithms.values()))
        print("\nSelect Algorithm Category:")
        for i, category in enumerate(categories, 1):
            print(f"{i}. {category.capitalize()}")
        
        try:
            cat_choice = int(input("Enter category number: "))
            if cat_choice < 1 or cat_choice > len(categories):
                print("❌ Invalid category choice!")
                return
            purpose = categories[cat_choice - 1]
        except ValueError:
            print("❌ Please enter a valid number!")
            return
        
        # Set input size
        try:
            input_size = int(input(f"\nEnter input array size for {purpose} algorithms (10-1000): "))
            if input_size < 10 or input_size > 1000:
                print("❌ Input size must be between 10 and 1000!")
                return
        except ValueError:
            print("❌ Please enter a valid number!")
            return
        
        # Set max players
        try:
            max_players = int(input("Enter maximum players (2-8, default 4): ") or "4")
            if max_players < 2 or max_players > 8:
                print("❌ Max players must be between 2 and 8!")
                return
        except ValueError:
            print("❌ Please enter a valid number!")
            return
        
        # Create room
        room_id = self.room_manager.create_room(
            self.current_player, room_name, purpose, input_size, max_players
        )
        
        self.current_room_id = room_id
        print(f"✅ Room created successfully!")
        print(f"🏠 Room ID: {room_id}")
        print(f"📋 Room Name: {room_name}")
        print(f"🎯 Purpose: {purpose.capitalize()}")
        print(f"📏 Input Size: {input_size}")
        print(f"👥 Max Players: {max_players}")
    
    def _browse_rooms_menu(self):
        """Menu for browsing and joining rooms."""
        print("\n" + "="*50)
        print("🔍 AVAILABLE BATTLEFIELD ROOMS")
        print("="*50)
        
        available_rooms = self.room_manager.list_available_rooms()
        
        if not available_rooms:
            print("❌ No rooms available! Create one or wait for others.")
            input("Press Enter to continue...")
            return
        
        print(f"{'#':<3} {'Room Name':<20} {'Host':<15} {'Purpose':<10} {'Size':<6} {'Players':<10}")
        print("-" * 70)
        
        for i, room in enumerate(available_rooms, 1):
            players_info = f"{len(room.players)}/{room.max_players}"
            print(f"{i:<3} {room.room_name[:19]:<20} {room.host_name[:14]:<15} "
                  f"{room.purpose:<10} {room.input_size:<6} {players_info:<10}")
        
        try:
            choice = int(input(f"\nEnter room number to join (1-{len(available_rooms)}) or 0 to go back: "))
            if choice == 0:
                return
            if choice < 1 or choice > len(available_rooms):
                print("❌ Invalid room choice!")
                return
            
            selected_room = available_rooms[choice - 1]
            if self.room_manager.join_room(selected_room.room_id, self.current_player):
                self.current_room_id = selected_room.room_id
                print(f"✅ Successfully joined room: {selected_room.room_name}")
            else:
                print("❌ Failed to join room! It might be full or no longer available.")
                
        except ValueError:
            print("❌ Please enter a valid number!")
    
    def _show_room_menu(self):
        """Show menu when player is in a room."""
        room = self.room_manager.get_room(self.current_room_id)
        if not room:
            print("❌ Room no longer exists!")
            self.current_room_id = None
            return
        
        print("\n" + "="*60)
        print(f"🏠 ROOM: {room.room_name} (ID: {room.room_id})")
        print(f"🎯 Purpose: {room.purpose.capitalize()} | 📏 Input Size: {room.input_size}")
        print(f"👑 Host: {room.host_name} | 📊 Status: {room.status.value.title()}")
        print("="*60)
        
        # Show players
        print("👥 PLAYERS:")
        for player_name, player in room.players.items():
            algo_status = "✅" if player.algorithm else "❌"
            input_status = "✅" if player.is_ready else "❌"
            crown = "👑" if player_name == room.host_name else "  "
            print(f"  {crown} {player_name:<15} | Algo: {algo_status} | Input: {input_status}")
        
        current_player = room.players.get(self.current_player)
        if not current_player:
            print("❌ You're no longer in this room!")
            self.current_room_id = None
            return
        
        print("\n📋 OPTIONS:")
        
        if room.status == RoomStatus.WAITING:
            if not current_player.algorithm:
                print("1. 🧠 Choose your algorithm")
            if not current_player.is_ready:
                print("2. 📝 Submit your input data")
            if len(room.players) >= 2 and all(p.algorithm and p.is_ready for p in room.players.values()):
                print("3. 🚀 Start the battle!")
        elif room.status == RoomStatus.READY:
            print("🔥 Battle is ready to start!")
            if room.host_name == self.current_player:
                print("3. 🚀 Start the battle!")
        elif room.status == RoomStatus.COMPLETED:
            print("🏆 Battle completed! Check results above.")
        
        print("8. 👥 Refresh room status")
        print("9. 🚪 Leave room")
        
        choice = input("\nEnter your choice: ").strip()
        
        if choice == "1" and not current_player.algorithm:
            self._choose_algorithm_menu(room)
        elif choice == "2" and not current_player.is_ready:
            self._submit_input_menu(room)
        elif choice == "3" and room.host_name == self.current_player and room.status == RoomStatus.READY:
            self._start_battle(room)
        elif choice == "8":
            pass  # Just refresh
        elif choice == "9":
            self._leave_room()
        else:
            print("❌ Invalid choice or action not available!")
    
    def _choose_algorithm_menu(self, room):
        """Menu for choosing algorithm."""
        available_algos = [a for a in algorithms.values() if a["category"] == room.purpose]
        taken_algos = [p.algorithm for p in room.players.values() if p.algorithm]
        
        print(f"\n🧠 CHOOSE YOUR {room.purpose.upper()} ALGORITHM:")
        print("-" * 40)
        
        available_choices = []
        for i, algo in enumerate(available_algos, 1):
            if algo in taken_algos:
                print(f"{i}. {algo['name']} ❌ (taken)")
            else:
                print(f"{i}. {algo['name']} ✅")
                available_choices.append((i, algo))
        
        try:
            choice = int(input(f"\nEnter algorithm number: "))
            selected_algo = None
            
            for num, algo in available_choices:
                if num == choice:
                    selected_algo = algo
                    break
            
            if selected_algo:
                if self.room_manager.get_room(room.room_id).set_player_algorithm(self.current_player, selected_algo):
                    print(f"✅ Algorithm selected: {selected_algo['name']}")
                else:
                    print("❌ Failed to set algorithm!")
            else:
                print("❌ Invalid choice or algorithm already taken!")
                
        except ValueError:
            print("❌ Please enter a valid number!")
    
    def _submit_input_menu(self, room):
        """Menu for submitting input data."""
        print(f"\n📝 SUBMIT INPUT DATA (Size: {room.input_size})")
        print("-" * 40)
        print("1. 📊 Generate random array")
        print("2. ✏️  Enter custom array")
        
        choice = input("Choose option (1-2): ").strip()
        
        if choice == "1":
            # Generate random array
            input_data = random.sample(range(1, room.input_size * 10), room.input_size)
            print(f"🎲 Generated random array: {input_data[:10]}{'...' if len(input_data) > 10 else ''}")
        elif choice == "2":
            # Custom input
            try:
                input_str = input(f"Enter {room.input_size} numbers (comma-separated): ")
                input_data = list(map(int, input_str.split(',')))
                if len(input_data) != room.input_size:
                    print(f"❌ Must provide exactly {room.input_size} numbers!")
                    return
            except ValueError:
                print("❌ Invalid input! Please enter valid numbers.")
                return
        else:
            print("❌ Invalid choice!")
            return
        
        target = None
        if room.target_required:
            try:
                target = int(input("Enter target value to search: "))
            except ValueError:
                print("❌ Invalid target value!")
                return
        
        if room.set_player_input(self.current_player, input_data, target):
            print("✅ Input data submitted successfully!")
        else:
            print("❌ Failed to submit input data!")
    
    def _start_battle(self, room):
        """Start the battle in the room."""
        print("\n🚀 STARTING BATTLE...")
        print("⚔️  Algorithms are fighting...")
        
        # Import and run the battle
        from utils.room_battle_runner import execute_room_battle
        
        try:
            results = execute_room_battle(room)
            self._display_battle_results(room, results)
            room.status = RoomStatus.COMPLETED
        except Exception as e:
            print(f"❌ Battle failed: {e}")
    
    def _display_battle_results(self, room, results):
        """Display battle results."""
        print("\n" + "🏆" * 20)
        print("🔥 BATTLE RESULTS 🔥")
        print("🏆" * 20)
        
        # Sort players by score
        sorted_results = sorted(results.items(), key=lambda x: x[1]['score'], reverse=True)
        
        print(f"\n{'Rank':<6} {'Player':<15} {'Algorithm':<20} {'Time(s)':<10} {'Memory(KB)':<12} {'Score':<8}")
        print("-" * 80)
        
        for rank, (player_name, result) in enumerate(sorted_results, 1):
            medal = "🥇" if rank == 1 else "🥈" if rank == 2 else "🥉" if rank == 3 else f"{rank}."
            print(f"{medal:<6} {player_name:<15} {result['algorithm'][:19]:<20} "
                  f"{result['time']:<10.4f} {result['memory']:<12.2f} {result['score']:<8.3f}")
        
        # Winner announcement
        winner = sorted_results[0]
        print(f"\n🎉 WINNER: {winner[0]} with {winner[1]['algorithm']}! 🎉")
        
        input("\nPress Enter to continue...")
    
    def _leave_room(self):
        """Leave the current room."""
        room = self.room_manager.get_room(self.current_room_id)
        if room and room.remove_player(self.current_player):
            print(f"✅ Left room: {room.room_name}")
        
        self.current_room_id = None

# Main entry point
if __name__ == "__main__":
    interface = RoomInterface()
    interface.start()
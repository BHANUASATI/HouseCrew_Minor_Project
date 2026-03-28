#!/usr/bin/env python3
"""
HouseCrew Project Structure Overview
Shows the organized file structure with file counts and descriptions
"""

import os
from pathlib import Path

def get_folder_size(folder_path):
    """Calculate total size of a folder"""
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(folder_path):
        for filename in filenames:
            filepath = os.path.join(dirpath, filename)
            if os.path.exists(filepath):
                total_size += os.path.getsize(filepath)
    return total_size

def get_file_count(folder_path):
    """Count files in a folder"""
    file_count = 0
    for dirpath, dirnames, filenames in os.walk(folder_path):
        file_count += len(filenames)
    return file_count

def show_project_structure():
    """Display the organized project structure"""
    base_path = "."
    
    print("🏠 HouseCrew Project - Organized Structure")
    print("=" * 50)
    
    folders = [
        ("📚 docs", "Documentation files"),
        ("🔧 backend", "FastAPI backend application"),
        ("🎨 src", "React frontend application"),
        ("📜 scripts", "Utility and maintenance scripts"),
        ("💾 backups", "Backup copies of important files"),
        ("📊 logs", "Database and log files"),
        ("🌐 public", "Static assets"),
        ("📦 node_modules", "npm dependencies")
    ]
    
    for folder, description in folders:
        folder_path = os.path.join(base_path, folder)
        if os.path.exists(folder_path):
            file_count = get_file_count(folder_path)
            folder_size = get_folder_size(folder_path)
            
            # Format size nicely
            if folder_size < 1024:
                size_str = f"{folder_size} B"
            elif folder_size < 1024 * 1024:
                size_str = f"{folder_size / 1024:.1f} KB"
            else:
                size_str = f"{folder_size / (1024 * 1024):.1f} MB"
            
            print(f"{folder:12} | {file_count:3} files | {size_str:8} | {description}")
        else:
            print(f"{folder:12} | {'---':3} files | {'---':8} | {description}")
    
    print("\n📋 Root Configuration Files:")
    root_files = [f for f in os.listdir(base_path) if os.path.isfile(f) and not f.startswith('.')]
    for file in root_files[:8]:  # Show first 8 files
        size = os.path.getsize(file)
        if size < 1024:
            size_str = f"{size} B"
        elif size < 1024 * 1024:
            size_str = f"{size / 1024:.1f} KB"
        else:
            size_str = f"{size / (1024 * 1024):.1f} MB"
        print(f"  📄 {file:25} | {size_str:8}")
    
    if len(root_files) > 8:
        print(f"  ... and {len(root_files) - 8} more files")
    
    print("\n🎯 Organization Benefits:")
    print("  ✅ Easy to locate files by purpose")
    print("  ✅ Clear separation of concerns")
    print("  ✅ Better maintainability")
    print("  ✅ Scalable structure")
    print("  ✅ Team collaboration friendly")

if __name__ == "__main__":
    show_project_structure()

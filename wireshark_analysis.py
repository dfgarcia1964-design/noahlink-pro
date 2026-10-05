#!/usr/bin/env python3
"""
Wireshark BLE Packet Analyzer - Phonak Audífonos
Analiza archivo .pcapng de Wireshark y extrae UUIDs y comandos
"""

import subprocess
import re
import json
from pathlib import Path

def analyze_pcapng(pcapng_file):
    """Analizar archivo pcapng con tshark"""

    print("📊 Analizando archivo Wireshark...")
    print(f"   Archivo: {pcapng_file}")
    print()

    # Comando tshark para extraer info BLE
    cmd = [
        'tshark',
        '-r', pcapng_file,
        '-Y', 'btle',
        '-T', 'fields',
        '-e', 'frame.number',
        '-e', 'frame.time_relative',
        '-e', 'btle.advertising_address',
        '-e', 'att.handle',
        '-e', 'att.value'
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

        if result.returncode != 0:
            print("❌ Error ejecutando tshark:")
            print(result.stderr)
            print()
            print("Instrucciones:")
            print("1. Instalar Wireshark (incluye tshark)")
            print("2. Agregar tshark al PATH (típicamente: C:\\Program Files\\Wireshark)")
            return None

        return result.stdout
    except FileNotFoundError:
        print("❌ tshark no encontrado en PATH")
        print()
        print("Para instalar:")
        print("1. Descargar Wireshark desde: https://www.wireshark.org/download/")
        print("2. Ejecutar instalador")
        print("3. Marcar 'Install Npcap'")
        print("4. Reiniciar")
        return None

def parse_output(output):
    """Parsear salida de tshark"""

    commands = {
        'volume': [],
        'program': [],
        'battery': [],
        'unknown': []
    }

    for line in output.strip().split('\n'):
        if not line:
            continue

        parts = line.split('\t')
        if len(parts) < 5:
            continue

        frame_num, timestamp, addr, handle, value = parts

        # Clasificar por tipo de comando
        if value:
            value_bytes = value.split(' ')

            # Detección simple de tipo
            if len(value_bytes) >= 2:
                # Primer byte = opcode
                opcode = value_bytes[0]

                if opcode == '01':  # Volumen
                    commands['volume'].append({
                        'frame': frame_num,
                        'time': timestamp,
                        'handle': handle,
                        'opcode': opcode,
                        'bytes': value,
                        'hex': value.replace(' ', '')
                    })
                elif opcode == '02':  # Programa
                    commands['program'].append({
                        'frame': frame_num,
                        'time': timestamp,
                        'handle': handle,
                        'opcode': opcode,
                        'bytes': value,
                        'hex': value.replace(' ', '')
                    })
                elif opcode == '03':  # Batería
                    commands['battery'].append({
                        'frame': frame_num,
                        'time': timestamp,
                        'handle': handle,
                        'opcode': opcode,
                        'bytes': value,
                        'hex': value.replace(' ', '')
                    })
                else:
                    commands['unknown'].append({
                        'frame': frame_num,
                        'time': timestamp,
                        'handle': handle,
                        'opcode': opcode,
                        'bytes': value,
                        'hex': value.replace(' ', '')
                    })

    return commands

def print_analysis(commands):
    """Imprimir análisis formateado"""

    print("=" * 70)
    print("📊 ANÁLISIS DE TRÁFICO BLE PHONAK")
    print("=" * 70)
    print()

    # Volumen
    if commands['volume']:
        print("🔊 COMANDOS DE VOLUMEN")
        print("-" * 70)
        for cmd in commands['volume']:
            print(f"  Frame {cmd['frame']:<5} | Time {cmd['time']:>10} | Handle {cmd['handle']:<5} | Bytes: {cmd['bytes']}")
        print()

    # Programa
    if commands['program']:
        print("📻 COMANDOS DE PROGRAMA")
        print("-" * 70)
        for cmd in commands['program']:
            print(f"  Frame {cmd['frame']:<5} | Time {cmd['time']:>10} | Handle {cmd['handle']:<5} | Bytes: {cmd['bytes']}")
        print()

    # Batería
    if commands['battery']:
        print("🔋 COMANDOS DE BATERÍA")
        print("-" * 70)
        for cmd in commands['battery']:
            print(f"  Frame {cmd['frame']:<5} | Time {cmd['time']:>10} | Handle {cmd['handle']:<5} | Bytes: {cmd['bytes']}")
        print()

    # Desconocidos
    if commands['unknown']:
        print("❓ OTROS COMANDOS")
        print("-" * 70)
        for cmd in commands['unknown'][:10]:  # Mostrar máximo 10
            print(f"  Frame {cmd['frame']:<5} | Opcode {cmd['opcode']} | Bytes: {cmd['bytes']}")
        if len(commands['unknown']) > 10:
            print(f"  ... y {len(commands['unknown']) - 10} más")
        print()

    # Resumen
    print("=" * 70)
    print("📈 RESUMEN")
    print("=" * 70)
    print(f"Comandos de volumen:  {len(commands['volume'])}")
    print(f"Comandos de programa: {len(commands['program'])}")
    print(f"Comandos de batería:  {len(commands['battery'])}")
    print(f"Otros:                {len(commands['unknown'])}")
    print()

    # Detectar patrones
    if commands['volume']:
        print("🔍 ANÁLISIS DE VOLUMEN")
        print("-" * 70)
        print("Valores segundo byte (potencial volumen):")
        for cmd in commands['volume'][:5]:
            bytes_list = cmd['bytes'].split()
            if len(bytes_list) > 1:
                print(f"  {bytes_list[1]} (frame {cmd['frame']})")
        print()

def main():
    """Función principal"""

    print()
    print("🎧 ANALIZADOR DE TRÁFICO BLE PHONAK")
    print()

    # Buscar archivos .pcapng
    pcap_files = list(Path('.').glob('*.pcapng')) + list(Path('.').glob('phonak*.pcap'))

    if not pcap_files:
        print("❌ No se encontraron archivos .pcapng")
        print()
        print("Instrucciones:")
        print("1. Abrir Wireshark")
        print("2. Capturar en interfaz Bluetooth")
        print("3. Hacer cambios en Phonak Target (volumen, programa)")
        print("4. Guardar como phonak_capture.pcapng")
        print()
        return

    for pcap_file in pcap_files:
        print(f"Encontrado: {pcap_file}")

        output = analyze_pcapng(str(pcap_file))

        if output:
            commands = parse_output(output)
            print_analysis(commands)

            # Guardar JSON
            json_file = pcap_file.stem + '_analysis.json'
            with open(json_file, 'w') as f:
                json.dump(commands, f, indent=2)
            print(f"✅ Análisis guardado en: {json_file}")

        print()

if __name__ == '__main__':
    main()

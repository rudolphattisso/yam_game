// app/components/board/grid/grid.component.js

import React, { useEffect, useContext, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";

const Grid = () => {

    const socket = useContext(SocketContext);

    const [displayGrid, setDisplayGrid] = useState(true);
    const [canSelectCells, setCanSelectCells] = useState([]);
    const [grid, setGrid] = useState([]);
    const safeGrid = Array.isArray(grid) ? grid : [];

    const handleSelectCell = (cellId, rowIndex, cellIndex) => {
        if (canSelectCells) {
            socket.emit("game.grid.selected", { cellId, rowIndex, cellIndex });
        }
    };

    useEffect(() => {
        const onGridViewState = (data) => {
            setDisplayGrid(data['displayGrid']);
            setCanSelectCells(Boolean(data['canSelectCells']));
            setGrid(Array.isArray(data['grid']) ? data['grid'] : []);
        };

        socket.on("game.grid.view-state", onGridViewState);

        return () => {
            socket.off("game.grid.view-state", onGridViewState);
        };
    }, [socket]);

    return (
        <View style={styles.gridContainer}>
            {displayGrid &&
                safeGrid.map((row, rowIndex) => (
                        <View key={row.map(cell => cell.id).join('-') + '-' + rowIndex} style={styles.row}>
                        {row.map((cell, cellIndex) => (
                            <TouchableOpacity
                                key={cell.id}
                                style={[
                                    styles.cell,
                                    cell.owner === "player:1" && styles.playerOwnedCell,
                                    cell.owner === "player:2" && styles.opponentOwnedCell,
                                        (cell.canBeChecked && cell.owner !== "player:1" && cell.owner !== "player:2") && styles.canBeCheckedCell,
                                    rowIndex !== 0 && styles.topBorder,
                                    cellIndex !== 0 && styles.leftBorder,
                                ]}
                                onPress={() => handleSelectCell(cell.id, rowIndex, cellIndex)}
                                disabled={!cell.canBeChecked}
                            >
                                <Text style={styles.cellText}>{cell.viewContent}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
        </View>
    );
};

const styles = StyleSheet.create({
    // 🎨 Conteneur grille
    gridContainer: {
        flex: 7,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        backgroundColor: "#1A3D22",
    },
    // 🎨 Lignes de grille
    row: {
        flexDirection: "row",
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    // 🎨 Cellules de base
    cell: {
        flexDirection: "row",
        flex: 2,
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(212, 175, 55, 0.4)",
        backgroundColor: "#FFF7E6",
    },
    // 🎨 Typographie des cellules
    cellText: {
        fontSize: 11,
        color: "#3D1F14",
        fontWeight: "700",
    },
    // 🎨 Cellule possédée joueur
    playerOwnedCell: {
        backgroundColor: "#2E7D32",
        opacity: 0.9,
    },
    // 🎨 Cellule possédée adversaire
    opponentOwnedCell: {
        backgroundColor: "#B71C1C",
        opacity: 0.9,
    },
    // 🎨 Cellule sélectionnable
    canBeCheckedCell: {
        backgroundColor: "#FFE082",
    },
    topBorder: {
        borderTopWidth: 1,
    },
    leftBorder: {
        borderLeftWidth: 1,
    },
});

export default Grid;


// app/components/board/grid/grid.component.js

import React, { useEffect, useContext, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";
import { BOARD_COLORS } from "../board-colors";

const Grid = () => {

    const socket = useContext(SocketContext);
    const { width } = useWindowDimensions();

    const [displayGrid, setDisplayGrid] = useState(true);
    const [canSelectCells, setCanSelectCells] = useState([]);
    const [grid, setGrid] = useState([]);
    const safeGrid = Array.isArray(grid) ? grid : [];
    const isSmallScreen = width < 520;
    const isVerySmallScreen = width < 420;

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
                                    isSmallScreen && styles.cellCompact,
                                    isVerySmallScreen && styles.cellVeryCompact,
                                    cell.owner === "player:1" && styles.playerOwnedCell,
                                    cell.owner === "player:2" && styles.opponentOwnedCell,
                                    (cell.canBeChecked && cell.owner !== "player:1" && cell.owner !== "player:2") && styles.canBeCheckedCell,
                                    rowIndex !== 0 && styles.topBorder,
                                    cellIndex !== 0 && styles.leftBorder,
                                ]}
                                onPress={() => handleSelectCell(cell.id, rowIndex, cellIndex)}
                                disabled={!cell.canBeChecked}
                            >
                                <Text style={[
                                    styles.cellText,
                                    isSmallScreen && styles.cellTextCompact,
                                    isVerySmallScreen && styles.cellTextVeryCompact,
                                ]}>{cell.viewContent}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
        </View>
    );
};

const styles = StyleSheet.create({
    // LAYOUT: Conteneur grille principal
    gridContainer: {
        width: "100%",
        aspectRatio: 1,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        backgroundColor: "#122C2A",
        borderRadius: 20,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "rgba(212, 175, 55, 0.45)",
        padding: 6,
        shadowColor: "#041514",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 12,
    },
    // LAYOUT: Lignes de grille
    row: {
        flexDirection: "row",
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.04)",
    },
    // LAYOUT: Cellules de grille
    cell: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1.25,
        borderColor: "rgba(255, 255, 255, 0.3)",
        backgroundColor: "#FFFDF7",
        paddingHorizontal: 4,
        paddingVertical: 6,
        margin: 1.5,
        borderRadius: 10,
        shadowColor: "#0B1020",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 1,
    },
    cellCompact: {
        paddingHorizontal: 3,
        paddingVertical: 4,
        borderRadius: 8,
    },
    cellVeryCompact: {
        paddingHorizontal: 2,
        paddingVertical: 2,
        borderRadius: 6,
    },
    // LAYOUT: Typographie des cellules
    cellText: {
        fontSize: 14,
        color: "#1F2937",
        fontWeight: "800",
        textAlign: "center",
        letterSpacing: 0.2,
        textShadowColor: "rgba(255,255,255,0.45)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
    cellTextCompact: {
        fontSize: 12,
    },
    cellTextVeryCompact: {
        fontSize: 10,
    },
    // LAYOUT: Etats de cellules
    playerOwnedCell: {
        backgroundColor: BOARD_COLORS.player1,
        borderColor: "rgba(122,17,17,0.88)",
        opacity: 0.95,
    },
    // 🎨 Cellule possédée adversaire
    opponentOwnedCell: {
        backgroundColor: BOARD_COLORS.player2,
        borderColor: "rgba(24,85,58,0.88)",
        opacity: 0.95,
    },
    // 🎨 Cellule sélectionnable
    canBeCheckedCell: {
        backgroundColor: "#FFF1BA",
        borderColor: "rgba(212,175,55,0.85)",
        shadowOpacity: 0.2,
        elevation: 2,
    },
    topBorder: {
        borderTopWidth: 0,
    },
    leftBorder: {
        borderLeftWidth: 0,
    },
});

export default Grid;


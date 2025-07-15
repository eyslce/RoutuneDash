import { useState, useEffect, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  Badge,
} from "@chakra-ui/react";
import { FaTrash, FaPause, FaPlay } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { EventsOn, EventsOff } from "../../wailsjs/runtime/runtime";

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
}

export default function Logs() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isAutoScroll] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [maxLogs] = useState(1000); // 最大日志条数
  const scrollRef = useRef<HTMLDivElement>(null);

  const clearLogs = async () => {
    setLogs([]); // 清空前端日志
  };

  const getLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case "ERROR":
        return "red";
      case "WARNING":
        return "orange";
      case "DEBUG":
        return "purple";
      case "INFO":
        return "blue";
      default:
        return "gray";
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current && isAutoScroll && !isPaused) {
      // 使用 requestAnimationFrame 确保 DOM 更新后再滚动
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    }
  };

  const addNewLog = (newLog: LogEntry) => {
    if (!isPaused) {
      setLogs(prevLogs => {
        const updatedLogs = [...prevLogs, newLog];
        // 限制日志条数，保留最新的maxLogs条
        if (updatedLogs.length > maxLogs) {
          return updatedLogs.slice(-maxLogs);
        }
        return updatedLogs;
      });
      // 添加新日志后滚动到底部
      scrollToBottom();
    }
  };

  useEffect(() => {
    // 监听实时日志事件
    const unsubscribe = EventsOn("new-log", addNewLog);
    
    // 清理函数
    return () => {
      unsubscribe();
      EventsOff("new-log");
    };
  }, [isPaused]);



  return (
    <Box flex={1} bg="bg" p={8} height="100%" color="fg" display="flex" flexDirection="column" overflow="hidden">
      <VStack gap={4} align="stretch" flex={1} overflow="hidden">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Text fontSize="2xl" fontWeight="bold">
            {t("pages.logs")}
          </Text>
          <HStack gap={3}>
            <Button
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
              variant="outline"
            >
              <Icon as={isPaused ? FaPlay : FaPause} mr={2} />
              {isPaused ? t('logs.resume') : t('logs.pause')}
            </Button>
            <Button
              size="sm"
              onClick={clearLogs}
              variant="outline"
              colorScheme="red"
            >
              <Icon as={FaTrash} mr={2} />
              {t('logs.clear')}
            </Button>
          </HStack>
        </HStack>

        <Box borderTop="1px solid" borderColor="border.subtle" />

        {/* Logs Container */}
        <Box
          ref={scrollRef}
          flex={1}
          bg="bg.subtle"
          borderRadius="md"
          border="1px solid"
          borderColor="border.subtle"
          overflowY="auto"
          overflowX="auto"
          p={4}
          fontFamily="mono"
          fontSize="sm"
          minH={0}
        >
            {logs.length === 0 ? (
              <Text textAlign="center" color="fg.muted" py={8}>
                {t('logs.empty')}
              </Text>
            ) : (
              <VStack gap={2} align="stretch">
                {logs.map((log, index) => (
                  <Box
                    key={index}
                    p={2}
                    borderRadius="sm"
                    bg="bg"
                    border="1px solid"
                    borderColor="border.subtle"
                  >
                    <HStack gap={3} align="start">
                      <Badge
                        colorScheme={getLevelColor(log.level)}
                        size="sm"
                        minW="60px"
                        textAlign="center"
                      >
                        {log.level}
                      </Badge>
                      <Text color="fg.muted" fontSize="xs" minW="140px">
                        {log.timestamp}
                      </Text>
                      <Text flex={1} wordBreak="break-all">
                        {log.message}
                      </Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}
        </Box>

        {/* Footer */}
        <HStack justify="space-between" fontSize="sm" color="fg.muted">
          <Text>
            {t('logs.total', { count: logs.length })}
          </Text>
          <HStack gap={4}>
            <HStack gap={2}>
              <Box
                w={3}
                h={3}
                borderRadius="full"
                bg={isAutoScroll ? "green.500" : "gray.400"}
              />
              <Text>{t('logs.autoscroll')}</Text>
            </HStack>
            <HStack gap={2}>
              <Box
                w={3}
                h={3}
                borderRadius="full"
                bg={isPaused ? "red.500" : "green.500"}
              />
              <Text>{isPaused ? t('logs.paused') : t('logs.live')}</Text>
            </HStack>
          </HStack>
        </HStack>
      </VStack>
    </Box>
  );
} 
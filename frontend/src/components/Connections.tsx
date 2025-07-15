import { 
  Box, 
  Heading, 
  SimpleGrid, 
  Table, 
  Text, 
  Flex,
  Input,
  Badge,
  IconButton,
  HStack,
  VStack,
  Spinner,
  For,
  createListCollection,
} from "@chakra-ui/react";
import { 
  SelectContent, 
  SelectItem, 
  SelectRoot, 
  SelectTrigger, 
  SelectValueText 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip } from "@/components/ui/tooltip";
import { toaster } from "@/components/ui/toaster";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import { FaSync, FaTimes, FaNetworkWired } from "react-icons/fa";
import { LuSearch } from "react-icons/lu";
import StatCard from "./StatCard";

// 模拟连接数据类型
interface Connection {
  id: string;
  source: string;
  destination: string;
  protocol: 'TCP' | 'UDP' | 'HTTP' | 'HTTPS';
  status: 'established' | 'connecting' | 'closed';
  duration: number;
  upload: number;
  download: number;
  uploadSpeed: number;
  downloadSpeed: number;
  startTime: Date;
}

// 模拟流量统计数据
interface TrafficStats {
  totalConnections: number;
  activeConnections: number;
  uploadSpeed: number;
  downloadSpeed: number;
  totalUpload: number;
  totalDownload: number;
}

export default function Connections() {
  const { t } = useTranslation();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [filteredConnections, setFilteredConnections] = useState<Connection[]>([]);
  const [trafficStats, setTrafficStats] = useState<TrafficStats>({
    totalConnections: 0,
    activeConnections: 0,
    uploadSpeed: 0,
    downloadSpeed: 0,
    totalUpload: 0,
    totalDownload: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [protocolFilter, setProtocolFilter] = useState(["all"]);
  const [statusFilter, setStatusFilter] = useState(["all"]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 格式化字节数
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化持续时间
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'established': return 'green';
      case 'connecting': return 'yellow';
      case 'closed': return 'red';
      default: return 'gray';
    }
  };

  // 模拟生成连接数据
  const generateMockConnection = (): Connection => {
    const protocols: Connection['protocol'][] = ['TCP', 'UDP', 'HTTP', 'HTTPS'];
    const statuses: Connection['status'][] = ['established', 'connecting', 'closed'];
    const sources = ['192.168.1.100', '10.0.0.1', '172.16.0.1', '127.0.0.1'];
    const destinations = ['8.8.8.8:443', '1.1.1.1:80', '223.5.5.5:53', '114.114.114.114:443'];
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      source: sources[Math.floor(Math.random() * sources.length)] + ':' + (Math.floor(Math.random() * 60000) + 1024),
      destination: destinations[Math.floor(Math.random() * destinations.length)],
      protocol: protocols[Math.floor(Math.random() * protocols.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      duration: Math.floor(Math.random() * 3600),
      upload: Math.floor(Math.random() * 1024 * 1024),
      download: Math.floor(Math.random() * 1024 * 1024 * 10),
      uploadSpeed: Math.floor(Math.random() * 1024 * 100),
      downloadSpeed: Math.floor(Math.random() * 1024 * 500),
      startTime: new Date(Date.now() - Math.floor(Math.random() * 3600000)),
    };
  };

  // 模拟获取数据
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 生成模拟数据
      const mockConnections = Array.from({ length: Math.floor(Math.random() * 20) + 5 }, generateMockConnection);
      
      // 计算统计数据
      const stats: TrafficStats = {
        totalConnections: mockConnections.length,
        activeConnections: mockConnections.filter(c => c.status === 'established').length,
        uploadSpeed: mockConnections.reduce((sum, c) => sum + c.uploadSpeed, 0),
        downloadSpeed: mockConnections.reduce((sum, c) => sum + c.downloadSpeed, 0),
        totalUpload: mockConnections.reduce((sum, c) => sum + c.upload, 0),
        totalDownload: mockConnections.reduce((sum, c) => sum + c.download, 0),
      };
      
      setConnections(mockConnections);
      setTrafficStats(stats);
    } catch (error) {
      toaster.create({
        title: "获取数据失败",
        description: "无法获取连接数据，请稍后重试",
        type: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 过滤连接
  useEffect(() => {
    let filtered = connections;
    
    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(conn => 
        conn.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conn.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conn.protocol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 协议过滤
    if (protocolFilter[0] !== 'all') {
      filtered = filtered.filter(conn => conn.protocol.toLowerCase() === protocolFilter[0]);
    }
    
    // 状态过滤
    if (statusFilter[0] !== 'all') {
      filtered = filtered.filter(conn => conn.status === statusFilter[0]);
    }
    
    setFilteredConnections(filtered);
  }, [connections, searchTerm, protocolFilter, statusFilter]);

  // 自动刷新
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchData, 3000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh]);

  // 初始化数据
  useEffect(() => {
    fetchData();
  }, []);

  // 手动刷新
  const handleRefresh = () => {
    fetchData();
  };

  // 关闭连接
  const handleCloseConnection = (id: string) => {
    setConnections(prev => prev.map(conn => 
      conn.id === id ? { ...conn, status: 'closed' as const } : conn
    ));
    toaster.create({
      title: "连接已关闭",
      type: "success",
      duration: 2000,
    });
  };

  // 创建选择器数据
  const protocolOptions = createListCollection({
    items: [
      { label: t("connections.filter_all"), value: "all" },
      { label: t("connections.filter_tcp"), value: "tcp" },
      { label: t("connections.filter_udp"), value: "udp" },
      { label: t("connections.filter_http"), value: "http" },
      { label: t("connections.filter_https"), value: "https" },
    ],
  });

  const statusOptions = createListCollection({
    items: [
      { label: t("connections.filter_all"), value: "all" },
      { label: t("connections.status_established"), value: "established" },
      { label: t("connections.status_connecting"), value: "connecting" },
      { label: t("connections.status_closed"), value: "closed" },
    ],
  });

  return (
    <Box flex="1" bg="bg" p={8} minH="100vh">
      <Flex justify="space-between" align="center" mb={6}>
        <Heading color="fg" display="flex" alignItems="center" gap={3}>
          <FaNetworkWired />
          {t("connections.title")}
        </Heading>
        <HStack>
          <Text fontSize="sm" color="fg.muted">
            {t("connections.auto_refresh")}
          </Text>
          <Switch
            checked={autoRefresh}
            onCheckedChange={(e) => setAutoRefresh(e.checked)}
            colorPalette="blue"
          />
          <Tooltip content={t("connections.refresh")}>
            <IconButton
              aria-label={t("connections.refresh")}
              onClick={handleRefresh}
              loading={isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading ? <Spinner size="sm" /> : <FaSync />}
            </IconButton>
          </Tooltip>
        </HStack>
      </Flex>

      {/* 流量统计卡片 */}
      <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} gap={4} mb={6}>
        <StatCard 
          title={t("connections.total_connections")} 
          value={trafficStats.totalConnections.toString()} 
        />
        <StatCard 
          title={t("connections.active_connections")} 
          value={trafficStats.activeConnections.toString()} 
        />
        <StatCard 
          title={t("connections.upload_speed")} 
          value={formatBytes(trafficStats.uploadSpeed) + '/s'} 
        />
        <StatCard 
          title={t("connections.download_speed")} 
          value={formatBytes(trafficStats.downloadSpeed) + '/s'} 
        />
        <StatCard 
          title={t("connections.total_upload")} 
          value={formatBytes(trafficStats.totalUpload)} 
        />
        <StatCard 
          title={t("connections.total_download")} 
          value={formatBytes(trafficStats.totalDownload)} 
        />
      </SimpleGrid>

      {/* 过滤和搜索 */}
      <Box bg="bg.subtle" borderRadius="md" p={4} mb={6} border="1px solid" borderColor="border.subtle">
        <Flex gap={4} wrap="wrap" align="center">
          <Box position="relative" maxW="300px">
            <Input
              placeholder={t("connections.search_placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              ps="2.5rem"
            />
            <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" color="fg.muted">
              <LuSearch />
            </Box>
          </Box>
          
          <SelectRoot
            collection={protocolOptions}
            size="sm"
            width="150px"
            value={protocolFilter}
            onValueChange={(e) => setProtocolFilter(e.value)}
          >
            <SelectTrigger>
              <SelectValueText placeholder={t("connections.filter_all")} />
            </SelectTrigger>
            <SelectContent>
              <For each={protocolOptions.items}>
                {(item) => (
                  <SelectItem item={item} key={item.value}>
                    {item.label}
                  </SelectItem>
                )}
              </For>
            </SelectContent>
          </SelectRoot>
          
          <SelectRoot
            collection={statusOptions}
            size="sm"
            width="150px"
            value={statusFilter}
            onValueChange={(e) => setStatusFilter(e.value)}
          >
            <SelectTrigger>
              <SelectValueText placeholder={t("connections.filter_all")} />
            </SelectTrigger>
            <SelectContent>
              <For each={statusOptions.items}>
                {(item) => (
                  <SelectItem item={item} key={item.value}>
                    {item.label}
                  </SelectItem>
                )}
              </For>
            </SelectContent>
          </SelectRoot>
          
          <Text fontSize="sm" color="fg.muted">
            显示 {filteredConnections.length} / {connections.length} 个连接
          </Text>
        </Flex>
      </Box>

      {/* 连接列表 */}
      <Box bg="bg.subtle" borderRadius="md" border="1px solid" borderColor="border.subtle">
        {filteredConnections.length === 0 ? (
          <VStack py={12} gap={4}>
            <FaNetworkWired size={48} color="gray" />
            <Text color="fg.muted" fontSize="lg">
              {t("connections.no_connections")}
            </Text>
          </VStack>
        ) : (
          <Table.Root variant="outline" size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>{t("connections.source")}</Table.ColumnHeader>
                <Table.ColumnHeader>{t("connections.destination")}</Table.ColumnHeader>
                <Table.ColumnHeader>{t("connections.protocol")}</Table.ColumnHeader>
                <Table.ColumnHeader>{t("connections.status")}</Table.ColumnHeader>
                <Table.ColumnHeader>{t("connections.duration")}</Table.ColumnHeader>
                <Table.ColumnHeader>{t("connections.upload")}</Table.ColumnHeader>
                <Table.ColumnHeader>{t("connections.download")}</Table.ColumnHeader>
                <Table.ColumnHeader>操作</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <For each={filteredConnections}>
                {(connection) => (
                  <Table.Row key={connection.id} _hover={{ bg: "bg.muted" }}>
                    <Table.Cell>
                      <Text fontFamily="mono" fontSize="sm">
                        {connection.source}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontFamily="mono" fontSize="sm">
                        {connection.destination}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge colorPalette="blue" variant="subtle">
                        {connection.protocol}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge 
                        colorPalette={getStatusColor(connection.status)}
                        variant="subtle"
                      >
                        {t(`connections.status_${connection.status}`)}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontSize="sm" fontFamily="mono">
                        {formatDuration(connection.duration)}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <VStack align="start" gap={1}>
                        <Text fontSize="xs" color="fg.muted">
                          {formatBytes(connection.upload)}
                        </Text>
                        <Text fontSize="xs" color="green.500">
                          {formatBytes(connection.uploadSpeed)}/s
                        </Text>
                      </VStack>
                    </Table.Cell>
                    <Table.Cell>
                      <VStack align="start" gap={1}>
                        <Text fontSize="xs" color="fg.muted">
                          {formatBytes(connection.download)}
                        </Text>
                        <Text fontSize="xs" color="blue.500">
                          {formatBytes(connection.downloadSpeed)}/s
                        </Text>
                      </VStack>
                    </Table.Cell>
                    <Table.Cell>
                      {connection.status !== 'closed' && (
                        <Tooltip content={t("connections.close")}>
                          <IconButton
                            aria-label={t("connections.close")}
                            size="xs"
                            colorPalette="red"
                            variant="ghost"
                            onClick={() => handleCloseConnection(connection.id)}
                          >
                            <FaTimes />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Table.Cell>
                  </Table.Row>
                )}
              </For>
            </Table.Body>
          </Table.Root>
        )}
      </Box>
    </Box>
  );
} 